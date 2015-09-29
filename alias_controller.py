import asyncio
import re

invalid_mention_name_chars = '<>~!@#$%^&*()=+[]{}\\|:;\'"/,.-_'

class AliasController:

    def __init__(self, base_url, db):
        self.base_url = base_url
        self.db = db

    @asyncio.coroutine
    def add_alias(self, client, alias_name, mentions):

        existing = yield from self.find_alias(client, alias_name)

        if existing and 'webhook_url' in existing:
            yield from client.room_client.delete_webhook(existing['webhook_url'])

        if not existing:

            webhook_url = yield from client.room_client.create_webhook(
                url="%s/mention/%s" % (self.base_url, alias_name),
                pattern=create_webhook_pattern(alias_name),
                name="Alias %s" % alias_name)

            spec = {
                "client_id": client.id,
                "group_id": client.group_id,
                "capabilities_url": client.capabilities_url,
                "alias": alias_name
            }
            data = {
                'mentions': mentions,
                'webhook_url': webhook_url
            }

            data.update(spec)
            yield from self.db.insert(data)
            return data

        return None

    @asyncio.coroutine
    def edit_alias(self, client, alias_name, mentions):
        existing = yield from self.find_alias(client, alias_name)
        if existing:
            spec = {
                "client_id": client.id,
                "group_id": client.group_id,
                "capabilities_url": client.capabilities_url,
                "alias": alias_name
            }
            data = {
                'mentions': mentions,
                'webhook_url': existing["webhook_url"]
            }

            existing.update(data)
            yield from self.db.update(spec, existing)
            return data

        return None

    @asyncio.coroutine
    def remove_alias(self, client, alias_name):
        existing = yield from self.find_alias(client, alias_name)
        if existing and 'webhook_url' in existing:
            yield from asyncio.gather(*[
                client.room_client.delete_webhook(existing['webhook_url']),
                self.db.remove(existing)
            ])

    @asyncio.coroutine
    def find_alias(self, client, name):
        result = yield from self.db.find_one({
            "client_id": client.id,
            "group_id": client.group_id,
            "capabilities_url": client.capabilities_url,
            "alias": name
        })

        return result

    @asyncio.coroutine
    def find_all_alias(self, client):
        results = yield from self.db.find({
            "client_id": client.id,
            "group_id": client.group_id,
            "capabilities_url": client.capabilities_url
        })
        return results


def _aliases_db(app):
    return app['mongodb'].default_database['aliases']

def create_webhook_pattern(alias):
    return "(?:(?:^[^/]|\/[^a]|\/a[^l]|\/ali[^a]|\/alia[^s]).*|^)%s(?:$| |[%s]).*" \
           % (alias, re.escape(invalid_mention_name_chars))

def validate_mention_name(mention_name: str):
    """
    Validates a mention name, throwing a ValueError if invalid.
    """

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
