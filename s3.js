require('dotenv').config();
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const region = process.env.S3_BUCKET_REGION;
const bucketName = process.env.S3_BUCKET_NAME;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey,
});
//upload file to s3
exports.uploadFile = function (file) {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
    };
    return s3.upload(uploadParams).promise();
};

exports.getImage = async function (key) {
    const data = s3
        .getObject({
            Bucket: bucketName,
            Key: key,
        })
        .promise();

    return data;
};

exports.encode = function (data) {
    let buf = Buffer.from(data);
    let base64 = buf.toString('base64');
    return base64;
};
//download file from s3
