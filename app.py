import json
import logging
import aiohttp_jinja2
import jinja2
import os
from aiohttp import web
from aiohttp_ac_hipchat.addon_app import create_addon_app
import asyncio
from util import HtmlNotification
from util import RoomNotificationArgumentParser

SCOPES_V2 = ["view_group", "send_notification", "admin_room", "view_room"]

FROM_NAME = "Alias"

log = logging.getLogger(__name__)
app, addon = create_addon_app(plugin_key="hc-alias-test",
                       addon_name="HC Alias",
                       from_name=FROM_NAME,
                       scopes=SCOPES_V2)

aiohttp_jinja2.setup(app, autoescape=True, loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), 'views')))

@asyncio.coroutine
def init(app):
    @asyncio.coroutine
    def send_welcome(event):
        client = event['client']
        yield from client.room_client.send_notification(text="HC Alias was added to this room")

    app['addon'].register_event('install', send_welcome)

app.add_hook("before_first_request", init)

@asyncio.coroutine
def capabilities(request):
    config = request.app["config"]
    base_url = config["BASE_URL"]
    return web.Response(text=json.dumps({
        "links": {
            "self": base_url,
            "homepage": base_url
        },
        "key": config.get("PLUGIN_KEY"),
        "name": config.get("ADDON_NAME"),
        "description": "HipChat connect add-on that sends supports aliases for group mention",
        "vendor": {
            "name": "Atlassian Labs",
            "url": "https://atlassian.com"
        },
        "capabilities": {
            "installable": {
                "allowGlobal": False,
                "allowRoom": True,
                "callbackUrl": base_url + "/installable"
            },
            "hipchatApiConsumer": {
                "scopes": SCOPES_V2,
                "fromName": FROM_NAME
            },
            "configurable": {
                "url":  base_url + "/config"
            },
            "webhook": [
                {
                    "url": base_url + "/alias",
                    "event": "room_message",
                    "pattern": "^/alias(\s|$).*"
                }
            ],
            "action": [
                {
                    "key": "alias.input.action",
                    "name": {
                        "value": "Find an alias"
                    },
                    "target": {
                        "type": "dialog",
                        "key": "alias.dialog"
                    },
                    "location": "hipchat.input.action",
                    "url": base_url + "/dialog"
                }
            ],
            "webPanel": [
                {
                    "key": "alias.dialog",
                    "name": {
                        "value": "Choose alias"
                    },
                    "target": {
                        "type": "dialog",
                        "title": "Choose alias",
                        "hint": "",
                        "button": "Done"
                    },
                    "location": "hipchat.sidebar.right",
                    "url": base_url + "/dialog"
                }
            ]
        }
    }))


@asyncio.coroutine
def alias(request):
    addon = request.app['addon']
    body = yield from request.json()
    client_id = body['oauth_client_id']
    client = yield from addon.load_client(client_id)

    parser = _create_parser(client, request)

    yield from parser.handle_webhook(body)

    return web.HTTPNoContent()


@asyncio.coroutine
def mention(request):
    alias_name = request.match_info['alias_name']

    addon = request.app['addon']
    body = yield from request.json()
    client_id = body['oauth_client_id']
    client = yield from addon.load_client(client_id)

    existing = yield from find_alias(client, alias_name)
    if existing:
        mentions = existing['mentions']

        txt = "said: {original} /cc {mentions}".format(
            original=body['item']["message"]["message"],
            mentions=" ".join(mentions))
        from_mention = body['item']['message']['from']['mention_name']
        yield from client.room_client.send_notification(from_mention=from_mention, text=txt)

        return web.HTTPNoContent()
    else:
        log.error("Mention name '%s' not found for client %s" % (alias_name, client_id))
        return web.HTTPBadRequest()

@asyncio.coroutine
def config(request):
    return web.Response(text="Awesome config")

@asyncio.coroutine
@addon.require_jwt()
@aiohttp_jinja2.template('dialog.jinja2')
def dialog(request):

    return {
        "base_url": app["config"]["BASE_URL"],
        "signed_request": request.signed_request,
    }

@asyncio.coroutine
@addon.require_jwt()
@aiohttp_jinja2.template('aliases.jinja2')
def get_aliases_view(request):
    results = []
    aliases = yield from find_all_alias(app, request.client)
    for status in aliases:
        results.append(alias_to_view(status))

    return {
        "aliases": results
    }

def alias_to_view(alias):
    return alias

@asyncio.coroutine
@addon.require_jwt()
def delete_alias(request):
    alias_name = request.match_info['alias_name']
    yield from remove_alias(alias_name, request.client)

    return web.HTTPOk()

@asyncio.coroutine
def remove_alias(alias, client):
    existing = yield from find_alias(client, alias)
    if existing and 'webhook_url' in existing:
        asyncio.gather(*[
            client.room_client.delete_webhook(existing['webhook_url']),
            _aliases_db(app).remove(existing)
        ])

@asyncio.coroutine
def find_alias(client, name):
    result = yield from _aliases_db(app).find_one({
        "client_id": client.id,
        "group_id": client.group_id,
        "capabilities_url": client.capabilities_url,
        "alias": name
    })
    return result


@asyncio.coroutine
def find_all_alias(app, client):
    results = yield from _aliases_db(app).find({
        "client_id": client.id,
        "group_id": client.group_id,
        "capabilities_url": client.capabilities_url
    })
    return results


def create_webhook_pattern(alias):
    return "(?:(?:^[^/]|\/[^a]|\/a[^l]|\/ali[^a]|\/alia[^s]).*|^)%s(?:$| ).*" % alias


def _create_parser(client, request):

    @asyncio.coroutine
    def list_aliases(_):
        aliases = yield from find_all_alias(app, client)
        if not aliases:
            return "No aliases registered. Register one with '/alias set @ALIAS @MENTION...'"
        else:
            return "Aliases registered: %s" % ", ".join([a['alias'] for a in aliases])

    @asyncio.coroutine
    def set_alias(args):
        try:
            for item in args.mentions + [args.alias]:
                validate_mention_name(item)
        except ValueError as e:
            return str(e)

        existing = yield from find_alias(client, args.alias)
        if existing and 'webhook_url' in existing:
            yield from client.delete_webhook(app.addon, existing['webhook_url'])

        webhook_url = yield from client.room_client.create_webhook(
                                                     url="%s/mention/%s" % (request.app["config"]["BASE_URL"], args.alias),
                                                     pattern=create_webhook_pattern(args.alias),
                                                     name="Alias %s" % args.alias)
        if webhook_url:
            aliases = _aliases_db(app)
            spec = {
                "client_id": client.id,
                "group_id": client.group_id,
                "capabilities_url": client.capabilities_url,
                "alias": args.alias
            }
            data = {
                'mentions': args.mentions,
                'webhook_url': webhook_url
            }
            if existing:
                existing.update(data)
                yield from aliases.update(spec, existing)
            else:
                data.update(spec)
                yield from aliases.insert(data)
            return "Alias %s added" % args.alias
        else:
            return "Problem registering webhook"

    @asyncio.coroutine
    def remove_alias(args):
        try:
            validate_mention_name(args.alias)
        except ValueError as e:
            return str(e)

        existing = yield from find_alias(client, args.alias)
        if existing and 'webhook_url' in existing:
            yield from client.room_client.delete_webhook(existing['webhook_url'])
            yield from _aliases_db(app).remove(existing)
            return "Alias %s removed" % args.alias
        else:
            return "Alias %s not found" % args.alias

    @asyncio.coroutine
    def show_alias(args):
        try:
            validate_mention_name(args.alias)
        except ValueError as e:
            return str(e)

        existing = yield from find_alias(client, args.alias)
        if existing and 'webhook_url' in existing:
            mentions = ['&commat;%s' % x[1:] for x in existing['mentions']]
            return HtmlNotification("Alias %s is mapped to %s" % (args.alias, ", ".join(mentions)))
        else:
            return "Alias %s not found" % args.alias

    parser = RoomNotificationArgumentParser(app, "/alias", client)
    subparsers = parser.add_subparsers(help='Available commands')

    subparsers.add_parser('list', help='List existing aliases', handler=list_aliases)

    parser_set = subparsers.add_parser('set', help='Sets a group mention alias', handler=set_alias)
    parser_set.add_argument('alias', metavar='@ALIAS', type=str, help='The mention alias, beginning with an "@"')
    parser_set.add_argument('mentions', metavar='@MENTION', nargs='+', type=str,
                            help='The mention names, beginning with an "@"')

    parser_set = subparsers.add_parser('remove', help='Removes a group mention alias', handler=remove_alias)
    parser_set.add_argument('alias', metavar='@ALIAS', type=str, help='The mention alias, beginning with an "@"')

    parser_show = subparsers.add_parser('show', help='Shows the names for an existing alias', handler=show_alias)
    parser_show.add_argument('alias', metavar='@ALIAS', type=str, help='The mention alias, beginning with an "@"')

    return parser


def validate_mention_name(mention_name: str):
    """
    Validates a mention name, throwing a ValueError if invalid.
    """
    invalid_mention_name_chars = '<>~!@#$%^&*()=+[]{}\\|:;\'"/,.-_'

    if mention_name is None:
        raise ValueError("The mention name is required")

    if not mention_name.startswith("@"):
        raise ValueError("The mention name must begin with a '@'")

    if not 0 < len(mention_name) < 50:
        raise ValueError("The mention name must be between 0 and 50 characters")

    name = mention_name[1:]
    if name in ["all", "aii", "hipchat"]:
        raise ValueError("The mention name is not valid")

    if any(x in name for x in invalid_mention_name_chars):
        raise ValueError("The mention name cannot contain certain characters: %s" %
                         invalid_mention_name_chars)
    if ' ' in name:
        raise ValueError("The mention name cannot contain multiple words")


def _aliases_db(app):
    return app['mongodb'].default_database['aliases']

app.router.add_static('/static', os.path.join(os.path.dirname(__file__), 'static'), name='static')
app.router.add_route('GET', '/', capabilities)
app.router.add_route('POST', '/alias', alias)
app.router.add_route('DELETE', '/alias/{alias_name}', delete_alias)
app.router.add_route('POST', '/mention/{alias_name}', mention)
app.router.add_route('GET', '/dialog', dialog)
app.router.add_route('GET', '/config', config)
app.router.add_route('GET', '/aliases_view', get_aliases_view)
