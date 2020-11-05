class ApiResponse {

    /**
     * Method ini digunakan untuk membuat api response (sigle data)
     * @param {string} res 
     * @param {string} status 
     * @param {string} msg 
     * @param {string} result 
     * @param {string} code 
     */
    static result(res, status, msg, result, code) {
        const results = {
            status: status,
            message: msg,
            result: result
        }

        return res.status(code).send(results)
    }

    /**
     * Method ini digunakan jika hasil dari result memiliki banyak data object (entries)
     * @param {string} res 
     * @param {string} status 
     * @param {string} msg 
     * @param {string} entries 
     * @param {string} code 
     */
    static withEntries(res, status, msg, entries, code) {
        const results = {
            status: status,
            message: msg,
            result: {
                entries: entries
            }
        }

        return res.status(code).send(results)
    }
}

export default ApiResponse;