const selectLanguage = (doc, lang) => {
    if (!doc || typeof doc !== 'object') {
        return doc;
    }

    if (Array.isArray(doc)) {
        return doc.map(item => selectLanguage(item, lang));
    }

    const newDoc = {};
    for (const key in doc) {
        if (Object.prototype.hasOwnProperty.call(doc, key)) {
            const value = doc[key];
            if ((key === 'name' || key === 'description' || key === 'title') && value && typeof value === 'object' && ('en' in value || 'ar' in value)) {
                newDoc[key] = value[lang] || value.en || value.ar || '';
            } else if (typeof value === 'object' && value !== null && !value._bsontype) {
                newDoc[key] = selectLanguage(value, lang);
            } else {
                newDoc[key] = value;
            }
        }
    }
    return newDoc;
};

const languageHandler = (req, res, next) => {
    const originalJson = res.json;
    const lang = req.headers['accept-language'] || 'en';

    res.json = function(data) {
        if (data && (typeof data === 'object')) {
            try {
                const plainObject = JSON.parse(JSON.stringify(data));
                const processedData = selectLanguage(plainObject, lang);
                originalJson.call(this, processedData);
            } catch (error) {
                console.error("Error processing language data:", error);
                originalJson.call(this, data);
            }
        } else {
            originalJson.call(this, data);
        }
    };

    next();
};

module.exports = languageHandler;