# tail-latest-sequentially-named-file

## Overview

Open latest sequentially-named file in a folder, and tail it until a newer file
comes along.

## Usage

Generally:

```javascript
const latestFileTail = require('tail-latest-sequentially-named-file')({
    folder: 'someFolder'
    // other options
}) ;
latestFileTail.currentTailStream.on('data', data => console.log(data)) ;

⋮

weAreDone.then(() => latestFileTail.close()) ;
```

Must specify a `folder`.

If file names do not simply begin with numbers, `fileNamePattern` and
`fileNamePatternMatchItem` may be used to find the sequence.

If not specified, the `TailingReadableStream` option `timeout` is set to
`false`; a different `timeout` may be specified, or the entire configuration
given to `TailingReadableStream` may be given using
`tailingReadableStreamOptions`.

Simple debugging messages may be sent to the console by enabling `debug: true`;
alternatively, you may specify your own logging functions by setting `log` and
`error` keys on the `logger` argument.

Example:

```javascript
const latestFileTail = require('tail-latest-sequentially-named-file')({
    folder: `${process.env.HOME}/My Sequential Files`
    // , debug: true
}) ;
process.on("SIGINT", () => {
    latestFileTail.close() ;
    process.exit() ;
}) ;
latestFileTail.currentTailStream.on("data", data => console.log(data)) ;
```

For instance, in the above example, if your "My Sequential Files" folder
contains:

    002.txt
    003.txt
    001.txt

…and you specify that folder name, the default file-name-match will determine
that `003.txt` is the latest file, and open a tail-watcher on it.

Later, if a new file is added:

    002.txt
    003.txt
    001.txt
    004.txt

…the new file will be detected, `003.txt` will no longer be tailed, and
instead `004.txt` will be tailed, with subsequent events coming from it.

## Packages on which this package depends

Tailing stream provided by [tailing-stream](https://github.com/jasontbradshaw/tailing-stream).
