# iobeam NodeJS Library

**[iobeam](https://iobeam.com)** is a data platform for connected devices.

This is a NodeJS library for sending data to **iobeam**.
For more information on the iobeam, please [check our our documentation](https://docs.iobeam.com).

*Please note that we are currently invite-only. You will need an invite
to generate a valid token and use our APIs.
([Sign up here](https://iobeam.com) for an invite.)*


## Before you start

Before you can start sending data to the iobeam backend, you'll need a
`project_id` and  `project_token` (with write-access enabled) for a valid
**iobeam** account. You can get these easily with our
[command-line interface (CLI) tool](https://github.com/iobeam/iobeam) or by
accessing your project settings from [our web app](https://app.iobeam.com).

You will need [Babel](https://www.npmjs.com/package/babel) to use the
libary:

    npm install -g babel


## Installation

To install, simply use npm:

    npm install iobeam-client

Then to include in a project:

    var iobeam = require('iobeam-client');

## Overview

This library allows NodeJS clients to send data to the
iobeam backend.

At a high-level, here's how it works:

1. Build an iobeam client object with your `project_id` and
`project_token`

1. Make sure your device is registered, either generating a `device_id` in
code or via another method (e.g., our CLI or REST APIs).

1. Create a `Datapoint` object for each time-series data point.

1. Add the data point under your `series_name` (e.g., "temperature")

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

    var iobeam = require('iobeam-client');

    ...

    builder = iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                .setSavePath('.')
                .register();
    var iobeamClient = builder.build();

(2) Provide your own (must be unique to your project):

    var iobeam = require('iobeam-client');

    ...

    builder = iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                .setSavePath('.')
                .register('my_desired_id');
    var iobeamClient = builder.build();

With the `setSavePath()` call, the `device_id` will be saved to disk at the
path provided (in our example, that's `.`, the current directory).
On future calls, this on-disk storage will be read first.
If a `device_id` exists, the `registerDevice` will do nothing; otherwise,
it will get a new random ID from us. If you provide a _different_ `device_id` to `registerDevice`, the old one will be replaced.

**With a registered `device_id`**

If you have registered a `device_id` (e.g. using our
[CLI](https://github.com/iobeam/iobeam)), you can pass this in the
constructor and skip the registration step.

    var iobeam = require('iobeam-client');

    ...

    var builder = iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                    .setSavePath('.')
                    .setDeviceId(DEVICE_ID);
    var iobeamClient = builder.build();

You *must* have registered some other way (CLI, website, previous
installation, etc) for this to work.

**Advanced: not saving to disk**

If you don't want the `device_id` to be automatically stored for you, simply
exclude the `setSavePath()` call while building:

    var builder = iobeam.Builder(PROJECT_ID, PROJECT_TOKEN).register()
    var iobeamClient = builder.build()

This is useful for cases where you want to persist the ID yourself (e.g.
in a settings file), or if you are making clients that are
temporary. For example, if the device you are using acts as a relay or
proxy for other devices, it could get the `device_id` from those devices
and have no need to save it.

### Tracking Time-series Data

For each time-series data point, create a `Datapoint` object, providing
a value and timestamp.

    t = getTemperature();
    d = iobeam.Datapoint(t, Date.now());
    // OR:
    // d = iobeam.Datapoint(t);

(The timestamp provided should be in milliseconds since epoch. The value
can be integral or real.)

Now, pick a name for your data series (e.g., "temperature"), and add the
point under that series:

    iobeamClient.addDataPoint("temperature", d)

Note that `iobeamClient` can hold several series at once. For
example, if you also had a `getHumidity()` function, you could add both
data points to the same `iobeam.Iobeam`:

    now = Date.now();
    dt = iobeam.Datapoint(getTemperature(), now);
    dh = iobeam.Datapoint(getHumidity(), now);

    iobeamClient.addDataPoint("temperature", dt)
    iobeamClient.addDataPoint("humidity", dh)


### Connecting to the iobeam backend

You can send your data stored in `iobeamClient` to the iobeam backend
easily:

    iobeamClient.send();

This call is asynchronous, and you can optionally provide a callback for
when it returns. The callback will be passed one argument: a boolean of
whether it was successful or not.

### Full Example

Here's the full source code for our example:

    var iobeam = require('iobeam-client');

    // Constants initialization
    PATH = ... # Can be None if you don't want to persist device_id to disk
    PROJECT_ID = ... # int
    PROJECT_TOKEN = ... # String
    ...

    // Init iobeam
    var builder = iobeam.Builder(PROJECT_ID, PROJECT_TOKEN)
                    .setSavePath('.')
                    .register();
    iobeamClient = builder.build()

    ...

    // Data gathering
    now = Date.now();
    dt = iobeam.Datapoint(getTemperature(), now);
    dh = iobeam.Datapoint(getHumidity(), now);

    iobeamClient.addDataPoint("temperature", dt);
    iobeamClient.addDataPoint("humidity", dh);

    ...

    // Data transmission
    iobeamClient.send();
