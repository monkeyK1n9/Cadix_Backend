import admin from 'firebase-admin';
import {getDownloadURL, getStorage} from 'firebase-admin/storage';

/**
 * Function to store file in firebase storage
 * @param userId user identifier in database
 * @param fileID file generated ID in database
 * @param fileData can be string or buffer. It is the file received from POST request on client side
 * @returns fileURL string
 */
export async function storeFile(userId: string, fileID: string, fileData: string | Buffer) {
    await getStorage().bucket(userId).file(fileID).save(fileData)

    const ref = await getStorage().bucket(userId).file(fileID)

    return getDownloadURL(ref);
}