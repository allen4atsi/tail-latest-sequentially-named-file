# tail-latest-sequentially-named-file

Open latest sequentially-named file in a folder, and tail it until a newer file
comes along.

For instance, if you have a folder containing:

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

Tailing stream provided by [tailing-stream](https://github.com/jasontbradshaw/tailing-stream).
