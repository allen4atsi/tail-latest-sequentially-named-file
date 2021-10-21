const TailingReadableStream = require('tailing-stream') ;
const fs = require('fs') ;
const path = require('path') ;
const EventEmitter = require('events') ;

module.exports = ({
    folder
    , fileNamePattern = /^\d+/
    , fileNamePatternMatchItem = 0
    , timeout = false
    , tailingReadableStreamOptions
    , debug = false
    , logger = {
        log: debug ? console.log : () => {}
        , error: debug ? console.error : () => {}
    }
}) => {
    logger.log({
        folder
        , fileNamePattern
        , fileNamePatternMatchItem
        , timeout
        , tailingReadableStreamOptions
        , debug
        , logger
    }) ;
    // Ensure pattern is RegExp
    if (!(fileNamePattern instanceof RegExp))
        throw new Error('File Name Pattern must be a RegExp with a numeric group.')
    ;
    // Ensure folder exists
    if (typeof folder !== 'string')
        throw new Error('Must specify folder path')
    ;
    if (!fs.statSync(folder).isDirectory())
        throw new Error('Path provided does not point to a folder/directory.')
    ;
    // Ensure at least 1 file found
    if (
        fs.readdirSync(folder)
            .filter(fileName => fileName.match(fileNamePattern) !== null)
            .length === 0
    )
        throw new Error('No files found matching file name pattern')
    ;
    // Find newest file
    let previousNewestFile ;
    let currentNewestFile ;
    let currentTailStreamDirect = { destroy: () => {}, destroyed: true } ;
    class CurrentTailStreamEmitter extends EventEmitter {}
    const currentTailStream = new CurrentTailStreamEmitter() ;
    function checkFileList() {
        const matchingFiles = fs.readdirSync(folder)
            .filter(fileName => fileName.match(fileNamePattern) !== null)
        ;
        currentNewestFile = matchingFiles
            .reduce(
                (accumulator, current) =>
                    Number(
                        current.match(fileNamePattern)[fileNamePatternMatchItem]
                    ) > Number(
                        accumulator.match(fileNamePattern)[fileNamePatternMatchItem]
                    )
                    ? current
                    : accumulator
            )
        ;
        if (currentNewestFile !== previousNewestFile) {
            currentTailStreamDirect.destroy() ; 
            previousNewestFile = currentNewestFile ;
            currentTailStreamDirect = TailingReadableStream.createReadStream(
                `${folder}${
                    folder.slice(-1) === path.sep
                    ? ''
                    : path.sep
                }${currentNewestFile}`
                , (
                    typeof tailingReadableStreamOptions === 'undefined'
                    ? {timeout}
                    : tailingReadableStreamOptions
                )
            ) ;
            currentTailStreamDirect.on('data', function() {
                currentTailStream.emit('data', ...arguments) ;
            }) ;
            logger.log(`Current newest file: ${currentNewestFile}`) ;
        }
    }
    checkFileList() ;
    const watcher = fs.watch(folder, () => checkFileList()) ;
    return {
        currentNewestFile: () => currentNewestFile
        , currentTailStream
        , close: () => {
            currentTailStreamDirect.destroy() ;
            watcher.close() ;
            logger.log('Destroyed tail stream and closed folder watcher.') ;
        }
    } ;
} ;
