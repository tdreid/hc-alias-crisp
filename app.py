import os
import asyncio
from flask import Flask, jsonify
from flask.ext.ac import create_notifications, create_installable, create_addon

app = Flask(__name__)

app.config.update({
    "DEBUG": True if "true" == os.environ.get("DEBUG", "true") else False,
    "PLUGIN_KEY": os.environ.get("PLUGIN_KEY", "hc-alias"),
    "ADDON_NAME": os.environ.get("ADDON_NAME", "Test me"),
    "FROM_NAME": os.environ.get("FROM_NAME", "Test")
})


base_url = "http://192.168.33.1:5000"

@asyncio.coroutine
def init():
    yield from create_addon(app)
    app.register_blueprint(create_installable('installable', allow_global=False), url_prefix="/installable")
    app.register_blueprint(create_notifications(1))
asyncio.get_event_loop().run_until_complete(init())

@app.route('/')
def capabilities():
    return jsonify({
        "links": {
            "self":         base_url,
            "homepage":     base_url
        },
        "key": app.config.get("PLUGIN_KEY"),
        "name": app.config.get("ADDON_NAME"),
        "description": "HipChat connect add-on that sends Bitbucket events to a room",
        "vendor": {
            "name": "Atlassian Labs",
            "url": "https://atlassian.com"
        },
        "capabilities": {
            "installable": {
                "allowGlobal": False,
                "allowRoom": True,
                "callbackUrl": base_url + "/installable/"
            },
            "hipchatApiConsumer": {
                "scopes": [
                    "view_group",
                    "send_notification"
                ],
                "fromName": app.config.get("FROM_NAME")
            }
        }
    })

if __name__ == "__main__":
    app.run(host="")