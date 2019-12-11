import axios from 'axios';

const url = process.env.VUE_APP_API + 'maps/';

class MapService {
    // Get maps
    static getMaps() {
        var a = new Promise(async (resolve, reject) => {
            try {
                const res = await axios.get(url);
                const data = res.data;
                resolve(
                    data.map(map => ({
                        ...map
                    }))
                );
            } catch(err) {
                reject(err);
            }
        });
        return a;
    }
    static getMarker(params) {
        var a = new Promise(async (resolve, reject) => {
            try {
                const res = await axios.get(url + params.id);
                resolve(res.data);
            } catch(err) {
                reject(err);
            }
        });
        return a;
    }
    static updateRating(params) {
        var a = new Promise(async (resolve, reject) => {
            try {
                const res = await axios.put(url + params.id, params);
                resolve(res.data);
            } catch(err) {
                reject(err);
            }
        })
        return a
    }
}

export default MapService;
