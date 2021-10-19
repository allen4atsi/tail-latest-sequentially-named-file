const TailingReadableStream = require('tailing-stream') ;
const fs = require('fs') ;

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
    // Find newest file
    const matchingFiles = fs.readdirSync(folder)
        .filter(fileName => fileName.match(fileNamePattern) !== null)
    ;
    if (matchingFiles.length === 0)
        throw new Error('No files found matching file name pattern')
    ;
    let currentNewestFile = matchingFiles
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
    logger.log(`Current newest file: ${currentNewestFile}`) ;
} ;
