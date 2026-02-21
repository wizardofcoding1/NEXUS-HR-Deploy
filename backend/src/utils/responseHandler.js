const sendResponse = (
    res,
    message,
    data = null,
    count = null,
    statusCode = 200,
    success = true,
) => {
    const response = {
        success,
        message,
        data,
    };

    if (count !== null) {
        response.count = count;
    }

    return res.status(statusCode).json(response);
};

module.exports = sendResponse;
