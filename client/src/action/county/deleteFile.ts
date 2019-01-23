import action from 'corla/action';
import { endpoint } from 'corla/config';
import { empty } from 'corla/util';

const deleteFileUrl = endpoint('delete-file');


async function deleteFile(fileType: string) {
    const init: RequestInit = {
        body: JSON.stringify( { fileType } ),
        credentials: 'include',
        method: 'post',
    };


    try {
        action('DELETE_FILE_SEND');

        const r = await fetch(deleteFileUrl, init);

        const received = await r.json().catch(empty);

        if (!r.ok) {
            action('DELETE_FILE_FAIL', received);
            return false;
        }

        action('DELETE_FILE_OK', received);
        return true;


    } catch (e) {
        action('DELETE_FILE_NETWORK_FAIL');

        throw e;

    }

}

export default deleteFile;
