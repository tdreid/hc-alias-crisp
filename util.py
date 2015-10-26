import argparse
import asyncio

class RoomNotificationArgumentParser(argparse.ArgumentParser):

    def __init__(self, app, command, client, **kwargs):
        if 'prog' not in kwargs:
            kwargs['prog'] = command
        super().__init__(**kwargs)
        self.client = client
        self.command = command
        self.app = app
        self.task = None

    def error(self, message):
        task = asyncio.Task(self.client.room_client.send_notification(html=message))
        raise ArgumentParserError(task)

    def print_help(self, file=None):
        message = self.format_help()
        self.task = asyncio.Task(self.client.room_client.send_notification(html="<pre>" + message + "</pre>"))

    def send_usage(self):
        message = self.format_usage()
        self.task = asyncio.Task(self.client.room_client.send_notification(text=message))
        return self.task

    def exit(self, status=0, message=None):
        raise ArgumentParserError(self.task)

    @asyncio.coroutine
    def handle_webhook(self, body):
        txt = body['item']["message"]["message"][len(self.command):]
        from_mention = body['item']['message']['from']['mention_name']
        items = [x for x in txt.split(" ") if x]
        # noinspection PyBroadException
        try:
            args = self.parse_args(items)
        except ArgumentParserError as e:
            if e.task:
                yield from e.task
            return

        try:
            msg = yield from args.func(args)
            if msg:
                if isinstance(msg, HtmlNotification):
                    yield from self.client.room_client.send_notification(from_mention=from_mention,
                                                             html=msg.__str__())
                else:
                    yield from self.client.room_client.send_notification(from_mention=from_mention, text=msg)
        except AttributeError:
            if self.task:
                yield from self.task
            elif not args.__dict__:
                yield from self.send_usage()
            else:
                raise

    def add_subparsers(self, **parent_kwargs):

        parent = self

        class MySubParser(RoomNotificationArgumentParser):
            def __init__(self, **kwargs):
                handler = kwargs.pop('handler')
                super().__init__(parent.app, parent.command, parent.client, **kwargs)
                self.set_defaults(func=handler)

        return super().add_subparsers(parser_class=MySubParser, **parent_kwargs)


class HtmlNotification(object):
    def __init__(self, text):
        super().__init__()
        self.text = text

    def __str__(self):
        return self.text


class ArgumentParserError(Exception):

    def __init__(self, task):
        self.task = task