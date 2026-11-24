# Self-Hosting Guide

Updated: November 23, 2026

This guide provides instructions for self-hosting the application to developers who already have experience with web development and server management.

Deploying on a PaaS (Platform as a Service) is the easiest way to self-host the application, but you can also serve the application on your own server with a reverse proxy and some knowledge of networking and security.

There are four deployment approaches covered in this guide:
- Deploying on Render (what the official deployment uses)
- Deploying on other PaaS (Platform as a Service)
- Serving the application on your own server & connecting via LAN
- Serving the application on your own server & exposing it to the internet

Each guide assumes you have already forked and cloned the repository.

You'll also need to set up a PostgreSQL database (either hosted or self-hosted). Roblox Chat Launcher uses Neon to host the database in the official deployment, but you can use any PostgreSQL database.

## Option 1. Deploying on Render

This is the easiest way to self-host the application as Roblox Chat Launcher is already configured to work with Render.

Before you begin, make sure you have set up a PostgreSQL database and [resolved the moderation API](#resolving-the-moderation-api).

### Server Requirements

The Roblox Chat Launcher includes a [render.yaml](./render.yaml) file that contains the configuration for deploying the application on Render. To deploy the application, you need to connect your GitHub repository to Render by [creating a new Blueprint Instance](https://dashboard.render.com/select-repo?type=blueprint) in your Workspace.

After the Project is created, create a new Environment Group named exactly `RobloxChatLauncher` and add the following environment variables:

```ini
DATABASE_URL="placeholder"
PERSPECTIVE_API_KEY=placeholder
RCL_ADMIN_KEY=placeholder
RCL_READ_KEY=placeholder
RCL_WRITE_KEY=placeholder
USER_SALT=placeholder
```

These required environment variables are stored in [server/config/env.js](./server/config/env.js). The `DATABASE_URL` is the connection string for your PostgreSQL database. For example, `postgresql://username:password@host...`.

Replace these placeholder values with your actual configuration values before deploying. API keys and secrets should be randomly generated where applicable and must not be shared publicly.

If you changed the expected key names in the code, make sure to update the environment variable names accordingly.

After this, start the deployment by clicking the "Manual Deploy" button on one of the 3 regional Web Services. Render will automatically read the [Dockerfile](./server/Dockerfile), build and push the image, and start the application. You can view the logs of the deployment in the Render dashboard.

The PostgreSQL database tables are automatically created if they do not exist (handled in [server/db/postgresPool.js](./server/db/postgresPool.js)).

### Client Requirements

On the client side, you need to change the `BASE_URL` variable located in [client/Core/Constants.cs](./client/Core/Constants.cs) to point to your server's URL. For example, if your server is hosted at `Foo.onrender.com`, you would change the line to:

```csharp
public const string BASE_URL = "chat.onrender.com";
```

Important formatting rules:

- Do not include a URI `https` or `wss`
- Do not include a colon `:`
- Do not include leading slashes `//`
- Do not include a trailing slash `/`

Example (correct):

`chat.onrender.com`

Example (incorrect):

`https://chat.onrender.com/`

After this, you can simply run the client application by running `cd client/ && dotnet run -c Release` in the terminal.

## Option 2. Deploying on other PaaS

Deploying on other PaaS is similar to deploying on Render, but you will have to configure the deployment yourself. The application is already configured to work with Docker, so you can use any PaaS that supports Docker.

Some relevant file paths your provider may require for deployment are:

- [server/Dockerfile](./server/Dockerfile)
- [server/server.js](./server/server.js)
- [server/package.json](./server/package.json)
- [server/package-lock.json](./server/package-lock.json)

You may need to specify the relevant files relative to the `server/` directory, depending on your provider.

Also depending on your provider, you may need to specify the port the application should listen on by setting the `PORT` environment variable. The application will default to port 10000 if the `PORT` variable is not set.

Some providers also require you to manually build the Docker image in a separate step and select the image to deploy.

The Express app setup defines the first proxy hop as the trusted IP address (`app.set('trust proxy', 1);` in [server/server.js](./server/server.js)). If your provider uses multiple proxy hops, you may need to change the number of trusted proxy hops in the code.

As with the Render deployment steps, you'll need to change the `BASE_URL` variable on the client side to point to your server's URL.

## Option 3. Serving on your own server (LAN)

Hosting the application on a local network (LAN) allows devices connected to the same network to communicate with your server without exposing it to the public internet.

Before you begin, make sure you have set up a PostgreSQL database and [resolved the moderation API](#resolving-the-moderation-api).

### Server Requirements

You will need a machine running the server application, a PostgreSQL database, and a reverse proxy capable of handling HTTPS and WebSocket connections.

The application uses HTTP internally, so you will need a reverse proxy to terminate TLS connections and forward requests to the application. The reverse proxy should listen on port 443 and forward incoming requests to the Node.js server's listening port (10000 by default).

You can use a reverse proxy such as Caddy, Nginx, or Apache. If you are using Docker, make sure the reverse proxy can reach the application container through the appropriate network.

The server must be accessible to other devices on your local network. You may configure a static IP address or DHCP reservation to prevent the server's address from changing. Alternatively, you can configure local DNS to allow devices to access your server using a hostname instead of an IP address.

The client currently connects over port 443, so your reverse proxy must be accessible on port 443. Custom ports are not supported through the `BASE_URL` configuration.

### HTTPS and WebSocket Configuration

The client connects to the server using a secure WebSocket connection (`wss://`). Your reverse proxy must therefore be configured to terminate TLS and forward WebSocket connections to the Node.js application.

You will need to configure a TLS certificate for your local hostname or IP address. Public certificate authorities generally cannot issue certificates for private IP addresses or internal-only domain names. You may need to use your own certificate authority and install its root certificate on client devices, or use a domain with a publicly trusted certificate and configure local DNS to direct connections to your server.

A LAN host will generally need one of these:
- A certificate issued by a CA trusted by the client.
- An internal CA, with its root certificate installed and trusted on client machines.
- A domain with a certificate from a publicly trusted CA, potentially using local DNS to direct the hostname to the local server.

If you use a self-signed certificate or an internal certificate authority, you must ensure that the certificate is trusted by the devices running the client. Otherwise, the client may be unable to establish a secure connection.

Make sure your reverse proxy forwards WebSocket upgrade requests correctly. Most modern reverse proxies support WebSocket connections without requiring extensive additional configuration.

### Firewall Configuration

Configure your server's firewall to allow incoming connections on port 443 from devices on your local network.

The Node.js application's listening port should not be exposed directly to other networks if it is only intended to be accessed through the reverse proxy. PostgreSQL should also remain inaccessible to client devices and should only accept connections from the server or other trusted systems that require database access.

### Client Configuration

On the client side, you need to change the `BASE_URL` variable located in [client/Core/Constants.cs](./client/Core/Constants.cs) to point to your server's local hostname or IP address.

For example, if your server is accessible using `192.168.1.100`, you would change the line to:

```csharp
public const string BASE_URL = "192.168.1.100";
```

If you configured local DNS, you can instead use your hostname:

```csharp
public const string BASE_URL = "chat.home.arpa";
```

Important formatting rules:

- Do not include a URI scheme such as `https` or `wss`.
- Do not include a colon (`:`).
- Do not include leading slashes (`//`).
- Do not include a trailing slash (`/`).

Example (correct):

`192.168.1.100`

`chat.home.arpa`

Example (incorrect):

`https://192.168.1.100/`

After this, you can run the client application by running `cd client/ && dotnet run -c Release` in the terminal.

## Option 4. Serving on your own server (Internet)

Hosting the application on your own server and exposing it to the internet allows users outside your local network to connect to it.

Before you begin, make sure you have set up a PostgreSQL database and [resolved the moderation API](#resolving-the-moderation-api).

### Server Requirements

You will need a server accessible from the internet, a PostgreSQL database, and a reverse proxy capable of handling HTTPS and WebSocket connections.

You can host the server on a VPS, dedicated server, or your own machine. If you are hosting on your own machine behind a router, you will need to configure port forwarding to allow external connections to reach your server.

The application uses HTTP internally, so you will need a reverse proxy to terminate TLS and forward incoming requests to the Node.js application. The reverse proxy should listen on port 443 and forward requests to the application's listening port (10000 by default).

You can use a reverse proxy such as Caddy, Nginx, or Apache. Make sure the reverse proxy is configured to handle WebSocket connections.

The client currently connects over port 443, so your reverse proxy must be accessible on port 443. Custom ports are not supported through the `BASE_URL` configuration.

### DNS Configuration

If you intend to use a domain name, you will need to configure DNS records to point to your server's public IP address.

For example, if you want to use `chat.example.com`, you would configure an appropriate DNS record (such as an `A` record or `AAAA` record) for your domain.

If you are hosting the application behind a residential internet connection, your public IP address may change. You may need to use Dynamic DNS (DDNS) or another method to keep your DNS records updated.

### HTTPS and WebSocket Configuration

The client connects to the server using `wss://`, so your reverse proxy must provide a valid TLS certificate for your public hostname.

You can use a certificate issued by a trusted certificate authority. Services such as Let's Encrypt can automatically issue and renew certificates for domains that meet their validation requirements.

Your reverse proxy must forward WebSocket upgrade requests to the Node.js application. Ensure that HTTPS and WebSocket connections are properly configured before allowing external access.

### Port Forwarding and Firewall Configuration

If you are hosting the application behind a home router, configure port forwarding to direct incoming TCP connections on port 443 to your server's local IP address.

You may also need to configure your server's firewall and your hosting provider's firewall to allow incoming connections on port 443.

Only expose the ports required for the application to function. The Node.js application and PostgreSQL database should not be directly accessible from the public internet. Incoming connections to the application should be handled through the reverse proxy.

If your internet service provider uses Carrier-Grade NAT (CGNAT), traditional port forwarding may not work. You may need to use a VPS, tunnel, or another method of providing public access to your server.

### Client Configuration

On the client side, you need to change the `BASE_URL` variable located in [client/Core/Constants.cs](./client/Core/Constants.cs) to point to your server's public hostname.

For example, if your server is accessible using `chat.example.com`, you would change the line to:

```csharp
public const string BASE_URL = "chat.example.com";
```

Important formatting rules:

- Do not include a URI scheme such as `https` or `wss`.
- Do not include a colon (`:`).
- Do not include leading slashes (`//`).
- Do not include a trailing slash (`/`).

Example (correct):

`chat.example.com`

Example (incorrect):

`https://chat.example.com/`

After this, you can run the client application by running `cd client/ && dotnet run -c Release` in the terminal.

### Security Considerations

Exposing the application to the internet means it can be accessed by anyone who can reach your server. Make sure you understand the security implications before making it publicly accessible.

- Use strong, randomly generated values for all required API keys and secrets.
- Keep the operating system, Node.js, dependencies, and reverse proxy up to date.
- Do not expose PostgreSQL or the application's internal listening port directly to the internet.
- Configure your firewall to allow only the ports and connections required by the application.
- Use HTTPS for all external connections.
- Monitor server logs for unusual activity and errors.
- Ensure your database is backed up regularly and that backups are stored securely.

You are responsible for maintaining and securing your self-hosted deployment.

---

## Resolving the Moderation API

Roblox Chat Launcher uses Perspective API for moderation, which will be/was officially sunset by Google on December 31, 2026. To resolve this, you can either remove the moderation feature from the application or set up your own moderation API.

The relevant code for message moderation is located at [server/services/moderationService.js](./server/services/moderationService.js).

If you're removing the API, the most straightforward way is to hardcode returning a score of 0 for the following attributes, as the client side expects the scores to be sent over for the local filter:

```javascript
const ATTRIBUTES = {
    TOXICITY: {},
    INSULT: {},
    PROFANITY: {},
    SEVERE_TOXICITY: {},
    IDENTITY_ATTACK: {},
    THREAT: {},
    SEXUALLY_EXPLICIT: {}
};
```

Perspective API responses generally look something like this (example retrievd from [developers.perspectiveapi.com/s/about-the-api-methods](https://developers.perspectiveapi.com/s/about-the-api-methods?language=en_US)):

```json
{
  "attributeScores": {
    "TOXICITY": {
      "summaryScore": {
        "value": 0.8627961,
        "type": "PROBABILITY"
      }
    },
    "UNSUBSTANTIAL": {
      "spanScores": [
        {
          "begin": 0,
          "end": 31,
          "score": {
            "value": 0.52690625,
            "type": "PROBABILITY"
          }
        },
        {
          "begin": 32,
          "end": 55,
          "score": {
            "value": 0.9106685,
            "type": "PROBABILITY"
          }
        }
      ],
      "summaryScore": {
        "value": 0.69036055,
        "type": "PROBABILITY"
      }
    }
  },
  "languages": [
    "en"
  ]
}
```

If you're replacing the API or simply want a cleaner solution, you should modify the client-side code to expect the correct attribute structure (or not expect any attributes at all). The relevant code for the client-side moderation is located at [client/Services/MessageFilterService.cs](./client/Services/MessageFilterService.cs) and the relevant DTO is [client/Models/PolicyScoresDto.cs](./client/Models/PolicyScoresDto.cs).
