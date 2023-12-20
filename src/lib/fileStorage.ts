import admin from 'firebase-admin';
import {getDownloadURL, getStorage} from 'firebase-admin/storage';
import axios from 'axios';

/**
 * Function to store file in firebase storage
 * @param fileID file generated ID in database
 * @param fileStoragePath where to store the file, usually of the form ${userId}/.../...
 * @param fileData can be string or buffer. It is the file received from POST request on client side
 * @returns fileURL string
 */
export async function storeFile(fileId: string, fileStoragePath: string, fileData: string | Buffer) {
    //store file
    await getStorage().bucket(fileStoragePath).file(fileId).save(fileData)

    // get reference of stored file to obtain download URL
    const ref = await getStorage().bucket(fileStoragePath).file(fileId)

    return getDownloadURL(ref);
}

// /**
//  * Function to create a new file in the user's bucket from empty IFC file template
//  * @param userId user identifier in database
//  * @param fileID file generated ID in database
//  * @returns fileURL string
//  */
// export async function getEmptyFile(userId: string, fileID: string) {

//     // FIX THIS. the user should create a new file from the browser
//     // we download empty ifc file and add it to user's storage bucket
//     const fileRef = await getStorage().bucket().file("newIFCFile.ifc");

//     const fileURL = await getDownloadURL(fileRef);
//     const response = await axios.get(fileURL,  { responseType: 'arraybuffer' });
//     const buffer = Buffer.from(response.data);

//     // store file in user's storage bucket
//     await getStorage().bucket(userId).file(fileID).save(buffer);

//     // get reference of stored file to obtain download URL
//     const newFileRef = await getStorage().bucket(userId).file(fileID)

//     return getDownloadURL(newFileRef);
// }


/**
 * Function to delete file and/or its bucket in firebase storage
 * @param storagePath of the bucket where the files are stored to delete it, usually of the form ${userId}/.../...
 * @param filename [optional] the name of the file. If provided deletes a particular file in a bucket
 */
export async function deleteFile(storagePath: string, filename: string = "") {
    if (!filename) {
        await getStorage().bucket(storagePath).delete();
    }
    else {
        await getStorage().bucket(storagePath).file(filename).delete();
    }

}