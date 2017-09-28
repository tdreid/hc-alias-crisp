# Alias #

A simple HipChat add-on that supports group mentions via room notifications.
# Commands #

```
#!html
usage: /alias [-h] {list,set,remove,show} ...
positional arguments:
  {list,set,remove,show}
                        Available commands
    list                List existing aliases
    set                 Sets a group mention alias
    remove              Removes a group mention alias
    show                Shows the names for an existing alias
optional arguments:
  -h, --help            show this help message and exit

```
Example:
```
#!html
/alias set @ateam @bob @anne @alex

```
Mentioning a team in a room will return another notification that mentions Bob, Anne and Alex.

# Run Alias yourself with Docker #

This is an experimental way for you to run Sassy yourself using Docker, which could be useful for "Behind the Firewall" (on-premises) Hipchat Data Center deployments.

This version of Alias links to a persistent Redis and Mongo containers which contains your installation/registration. If you destroy the linked containers, you'll have to uninstall and reinstall the Dockerized-Sassy on your Hipchat deployment.

If you decide to use this in production, you'll want to use your own SSL termination and port forwarding from the Docker host to protect your Sassy traffic. You can use a proxy such as NGINX or HAProxy for this.

If you'll be running this on a deployment without access to the internet, your process will look something like this:

1. Clone this repository.
2. Build a container from the repository.
3. Pass the container to your on-premises deployment using whatever process is approved by your organization.
4. Run the container on a host within your firewall. Optionally, you may also push the image to a Docker Registry, Docker Trusted Registry, or Docker Datacenter repository.


### Setup and Prerequisites ###

1. Check for port conflicts on port 3022. Alias will use this port so you want it to be available.
2. Clone this source repository to your local machine: git clone https://bitbucket.org/atlassianlabs/hc-alias.git

### Build the container ###

Change directories to the source you just cloned: cd hc-alias

Run the following command to use the Dockerfile in this repo to build a container with the latest version of Alias. sudo docker build -t atlassian_labs/alias:latest .

### Run ###

1. Export the following variable in your shell: `export BASE_URL=http://your-docker-host-fqdn:3022`

2. Run the following command to use the Docker Compose file in this repo to run the Alias service. `docker-compose up -d`

3. Check the logs to make sure everything went smoothly using the following command.  `docker-compose logs`

4. Verify that the following URL returns a valid capabilities.json response. (Replace 'your-docker-host-fqdn' with your actual host.) http://your-docker-host-fqdn:3022/addon/capabilities

### Install Alias on your Hipchat instance ###
Next, make your Dockerized version of Sassy available on your Hipchat service.

**Note:** You must be at least a room admin to install an integration in a room. Only admins can install
integrations globally.

1. Log in to your Hipchat instance.
2. If you're using Hipchat Cloud or Hipchat Server, click the Manage tab.
3. If you're using Hipchat Data Center, log in to the web portal and click **Add-ons** in the left navigation.
4. Click **Install an add-on from a descriptor URL**.
5. In the dialog that appears, enter the URL you used above: http://your-docker-host-fqdn:3022/addon/capabilities Hipchat verifies the add-on capabilities, and adds it to your deployment.

### Play ###

Go to a chat room and type /alias

### Things to remember ###

1. You may want to use a firewall or iptables at the Docker host level to set ACLs and filter traffic.
2. Use your own SSL termination and port forwarding from the Docker host to protect your Sassy traffic. You can use a proxy for this.
3. The Sassy Docker container publishes through the host port 3020. Check for port conflicts before you run it!
4. If installing to Hipchat Server your HC Server should have a valid trusted SSL cert from a major CA vendor. Self signed is not supported (yet).
5. To debug you can override the entry point by using `docker run --interactive --tty ...` and appending `/bin/bash`



# [Install me](https://hipchat.com/addons/install?url=https%3A%2F%2Fhc-alias.herokuapp.com) ###