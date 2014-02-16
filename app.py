from flask import jsonify
from flask.ext.ac import create_addon_app

app = create_addon_app(__name__,
                       plugin_key="hc-alias",
                       addon_name="HC Alias",
                       from_name="Alias",
                       base_url="http://192.168.33.1:5000")

@app.route('/')
def capabilities():
    return jsonify({
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
                    "send_notification"
                ],
                "fromName": app.config.get("FROM_NAME")
            }
        }
    })

if __name__ == "__main__":
    app.run(host="")