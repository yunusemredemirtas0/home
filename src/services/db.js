import pb from '../lib/pocketbase';

export const getUserData = async (id) => {
    try {
        return await pb.collection('users').getOne(id);
    } catch (e) {
        console.error("Error getting user data", e);
        return null;
    }
}
