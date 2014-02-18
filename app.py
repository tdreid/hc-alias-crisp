import logging
import os
import asyncio
from bottle_ac import create_addon_app

log = logging.getLogger(__name__)
app = create_addon_app(__name__,
                       plugin_key="hc-alias",
                       addon_name="HC Alias",
                       from_name="Alias",
                       base_url="http://192.168.33.1:8080")

app.config['MONGO_URL'] = os.environ.get("MONGOHQ_URL", None)
app.config['REDIS_URL'] = os.environ.get("REDISTOGO_URL", None)


invalid_mention_name_chars = '<>~!@#$%^&*()=+[]{}\\|:;\'"/,.-_'


# noinspection PyUnusedLocal
@app.route('/')
def capabilities(request, response):
    return {
        "links": {
            "self":         app.config.get("BASE_URL"),
            "homepage":     app.config.get("BASE_URL")
        },
        "key": app.config.get("PLUGIN_KEY"),
        "name": app.config.get("ADDON_NAME"),
        "description": "HipChat connect add-on that sends supports aliases for group mention",
        "vendor": {
            "name": "Atlassian Labs",
            "url": "https://atlassian.com"
        },
        "capabilities": {
            "installable": {
                "allowGlobal": False,
                "allowRoom": True,
                "callbackUrl": app.config.get("BASE_URL") + "/installable/"
            },
            "hipchatApiConsumer": {
                "scopes": [
                    "view_group",
                    "send_notification",
                    "admin_room"
                ],
                "fromName": app.config.get("FROM_NAME")
            },
            "webhook": [
                {
                    "url": app.config.get("BASE_URL") + "/alias",
                    "event": "room_message",
                    "pattern": "^/alias.*"
                }
            ],
        }
    }


@app.route('/alias', method='POST')
@asyncio.coroutine
def alias(request, response):
    body = request.json
    client_id = body['oauth_client_id']
    client = yield from app.addon.load_client(client_id)
    txt = body['item']["message"]["message"][len("/alias"):]
    from_mention = body['item']['message']['from']['mention_name']

    items = [x for x in txt.split(" ") if x]
    if len(items) < 2:
        yield from client.send_notification(app.addon, from_mention=from_mention,
                                            text="Missing mention names to assign to alias. Format: "
                                                 "/alias @ALIAS @MENTION_1 [@MENTION_2...]")
        response.status = 204
        return

    try:
        for item in items:
            validate_mention_name(item)
    except ValueError as e:
        yield from client.send_notification(app.addon, from_mention=from_mention,
                                            text=str(e))
        return

    alias_name = items[0]
    mentions = items[1:]

    existing = yield from find_alias(app.addon, client, alias_name)
    if existing and 'webhook_url' in existing:
        yield from client.delete_webhook(app.addon, existing['webhook_url'])

    webhook_url = yield from client.post_webhook(app.addon,
                                                 url="%s/mention/%s" % (app.config.get("BASE_URL"), alias_name),
                                                 pattern=".*%s(?:$| ).*" % alias_name,
                                                 name="Alias %s" % alias_name)
    if webhook_url:
        aliases = app.addon.mongo_db['aliases']
        spec = {
            "client_id": client_id,
            "group_id": client.group_id,
            "capabilities_url": client.capabilities_url,
            "alias": alias_name
        }
        data = {
            'mentions': mentions,
            'webhook_url': webhook_url
        }
        if existing:
            existing.update(data)
            yield from aliases.update(spec, existing)
        else:
            data.update(spec)
            yield from aliases.insert(data)
        yield from client.send_notification(app.addon, from_mention=from_mention,
                                            text="Alias added webhook")
    else:
        yield from client.send_notification(app.addon, from_mention=from_mention,
                                            text="Problem registering webhook")
        response.status = 400


@app.route('/mention/<alias_name>', method='POST')
@asyncio.coroutine
def mention(request, response, alias_name):
    body = request.json
    client_id = body['oauth_client_id']
    client = yield from app.addon.load_client(client_id)

    existing = yield from find_alias(app.addon, client, alias_name)
    if existing:
        mentions = existing['mentions']

        txt = "said: {original} /cc {mentions}".format(
            original=body['item']["message"]["message"],
            mentions=" ".join(mentions))
        from_mention = body['item']['message']['from']['mention_name']
        yield from client.send_notification(app.addon, from_mention=from_mention, text=txt)
        response.status = 204
    else:
        log.error("Mention name '%s' not found" % alias_name)
        response.status = 400


@asyncio.coroutine
def find_alias(addon, client, name):
    aliases = addon.mongo_db['aliases']
    result = yield from aliases.find_one({
        "client_id": client.id,
        "group_id": client.group_id,
        "capabilities_url": client.capabilities_url,
        "alias": name
    })
    return result


def validate_mention_name(full_alias):
    """
    @type full_alias: str
    """

    if full_alias is None:
        raise ValueError("The mention name is required")

    if not full_alias.startswith("@"):
        raise ValueError("The mention name must begin with a '@'")

    if not 0 < len(full_alias) < 50:
        raise ValueError("The mention name must be between 0 and 50 characters")

    name = full_alias[1:]
    if name in ["all", "aii", "hipchat"]:
        raise ValueError("The mention name is not valid")

    if any(x in name for x in invalid_mention_name_chars):
        raise ValueError("The mention name cannot contain certain characters: %s" %
                         invalid_mention_name_chars)
    if ' ' in name:
        raise ValueError("The mention name cannot contain multiple words")


if __name__ == "__main__":
    app.run(host="", reloader=True, debug=True)