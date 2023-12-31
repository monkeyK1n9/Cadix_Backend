"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.storeFile = void 0;
const storage_1 = require("firebase-admin/storage");
/**
 * Function to store file in firebase storage
 * @param fileID file generated ID in database
 * @param fileStoragePath where to store the file, usually of the form ${userId}/.../...
 * @param fileData can be string or buffer. It is the file received from POST request on client side
 * @returns fileURL string
 */
function storeFile(fileId, fileStoragePath, fileData) {
    return __awaiter(this, void 0, void 0, function* () {
        //store file
        yield (0, storage_1.getStorage)().bucket(fileStoragePath).file(fileId).save(fileData);
        // get reference of stored file to obtain download URL
        const ref = yield (0, storage_1.getStorage)().bucket(fileStoragePath).file(fileId);
        return (0, storage_1.getDownloadURL)(ref);
    });
}
exports.storeFile = storeFile;
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
function deleteFile(storagePath, filename = "") {
    return __awaiter(this, void 0, void 0, function* () {
        if (!filename) {
            yield (0, storage_1.getStorage)().bucket(storagePath).delete();
        }
        else {
            yield (0, storage_1.getStorage)().bucket(storagePath).file(filename).delete();
        }
    });
}
exports.deleteFile = deleteFile;
