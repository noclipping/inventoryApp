// takes req.file as the first parameter and express validator errors as the second (to push into the errors array)
exports.fileValidation = function (fileData, errors) {
    console.log('FILEDATA:', fileData);
    if (fileData.size > 2000000) {
        console.log('file size too large!');
        errors.errors.push({
            value: '',
            msg: 'File size too large!',
            param: 'file',
            location: 'body',
        });
    }
    if (
        !(
            fileData.mimetype === 'image/png' ||
            fileData.mimetype === 'image/jpeg'
        )
    ) {
        console.log('not an image!');
        errors.errors.push({
            value: '',
            msg: 'Not an image!',
            param: 'file',
            location: 'body',
        });
    }
};
