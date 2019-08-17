import axios from 'axios';

export function apiCall(method, url, data) {
    return new Promise((resolve, reject) => {
        return axios({ method, url, data})
            .then(res => {
                return resolve(res.data);
            })
            .catch((err) => {
                if (err.response) {
                    return reject(err.response.data);
                }
                else if (err.request) {
                    return reject({ message: "something went wrong." });
                }
                else {
                    return reject(err.message || err);
                }
            });
    });
}
