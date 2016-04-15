# iobeam NodeJS Library

**[iobeam](https://iobeam.com)** is a data platform for connected devices.

This is a NodeJS library for sending data to **iobeam**.
For more information on the iobeam, please [check out our documentation](https://docs.iobeam.com).

*Please note that we are currently invite-only. You will need an invite
to generate a valid token and use our APIs.
([Sign up here](https://iobeam.com) for an invite.)*


## Before you start

Before you can start sending data to the iobeam backend, you'll need a
`project_id` and  `project_token` (with write-access enabled) for a valid
**iobeam** account. You can get these easily with our
[command-line interface (CLI) tool](https://github.com/iobeam/iobeam) or by
accessing your project settings from [our web app](https://app.iobeam.com).


## Installation

To install, simply use npm:

    npm install iobeam-client

Then to include in a project:
```javascript
var iobeam = require('iobeam-client');
```

By default, an installation script attempts to decide if Babel should be used
(i.e. for Node versions older than 4.0.0). If you would like to force Babel
to be used even with newer versions of Node (e.g. when using the library
as part of a web app), add the following to your `package.json`:

    "iobeam": {
        "es5": true
    }

## Overview

This library allows NodeJS clients to send data to the
iobeam backend.

At a high-level, here's how it works:

1. Build an iobeam client object with your `project_id` and
`project_token`

1. Make sure your device is registered, either generating a `device_id` in
code or via another method (e.g., our CLI or REST APIs).

1. Create a `DataStore` object for groups of related time-series.

1. Add rows to the `DataStore` for readings at a timestamp.

1. When you're ready, send your data to the iobeam backend

## Getting Started

Here's how to get started, using a basic example that sends temperature
data to iobeam. (For simplicity, let's assume that the current temperature
can be accessed with `getTemperature()`).

(Reminder: Before you start, create a user account, project, and
project_token (with write access) using the iobeam APIs, CLI or web app.
Write down your new `project_id` and `project_token`.)

### iobeam Initialization

There are several ways to initialize the iobeam client. All require
that you have `project_id` and `project_token` before hand.

**Without a registered `device_id`**

Perhaps the most natural way is to let the device register itself.
There are two ways to register a `device_id`:

(1) Let iobeam generate one for you:
```javascript
var builder = new iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                    .saveToDisk()
                    .register();
var iobeamClient = builder.build();
```

(2) Provide your own (must be unique to your project):
```javascript
// Just specifying the device id:
var device = new iobeam.Device('my_desired_id');
// Specifying a device id, name, and type:
var device = new iobeam.Device('my_desired_id', 'device_name', 'device_type');

// Register it during initialization
var builder = new iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                    .saveToDisk()
                    .register(device);
var iobeamClient = builder.build();
```

With the `saveToDisk()` call, the `device_id` will be saved to disk at the
path (optionally) provided (default is to use the current directory).
On future calls, this on-disk storage will be read first.
If the file exists and no id is provided to `register()`,
the one from the file will be used. If the file exists and a _different_ id is
provided, the old one will be replaced.

**With a registered `device_id`**

If you have registered a `device_id` (e.g. using our
[CLI](https://github.com/iobeam/iobeam)), you can pass this in the
constructor and skip the registration step.
```javascript
var builder = new iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                    .saveToDisk()
                    .setDeviceId(DEVICE_ID);
var iobeamClient = builder.build();
```

You *must* have registered some other way (CLI, website, previous
installation, etc) for this to work.

**Advanced: not saving to disk**

If you don't want the `device_id` to be automatically stored for you, simply
exclude the `saveToDisk()` call while building:
```javascript
var builder = new iobeam.Builder(PROJECT_ID, PROJECT_TOKEN).register();
var iobeamClient = builder.build();
```

This is useful for cases where you want to persist the ID yourself (e.g.
in a settings file), or if you are making clients that are
temporary. For example, if you are writing a proxy for other devices, those
devices will provide the id needed for the iobeam client.

### Tracking Time-series Data

To track data, you'll need to create a `iobeam.DataStore` object that can
be used to track one or more series of data. To initialize, you create
the `DataStore` with the series it will track:
```javascript
// conditions will be a `iobeam.DataStore` and `iobeamClient` will keep track of it.
var conditions = iobeamClient.createDataStore(["temperature", "humidity"]);
```

The columns are a list of strings. You should group series that are collected
on the same measurement cycle together. For example, if you collect temperature
and humidity every 10s, you should group them together; however, if you also
collect another metric only every 30s, that should get its own `DataStore`.
Then, when you have a measurement, add it to the store as an object, where values
are keyed by the series they belong to:
```javascript
var now = Date.now();
conditions.add(now, {temperature: getTemperature(), humidity: getHumidity()});
```

You can exclude fields in some rows, but if you find this happens more often than
not, you should consider reorganizing your stores.

### Connecting to the iobeam backend

You can send your data stored in `iobeamClient` to the iobeam backend
easily:
```javascript
iobeamClient.send();
```

This call is asynchronous, and you can optionally provide a callback for
when it returns. The callback will be passed one argument: a boolean of
whether it was successful or not.

### Full Example

Here's the full source code for our example:
```javascript
var iobeam = require('iobeam-client');

// Constants initialization
PROJECT_ID = ...  // int
PROJECT_TOKEN = ... // String
...

// Init iobeam
var builder = new iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                    .saveToDisk()
                    .register();
var iobeamClient = builder.build();

// Data store initialization
var conditions = iobeamClient.createDataStore(["temperature", "humidity"]);

...

// Data gathering
var now = Date.now();
conditions.add(now, {temperature: getTemperature(), humidity: getHumidity()});

...

// Data transmission
iobeamClient.send();
```
