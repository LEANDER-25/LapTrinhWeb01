const exp = require('constants');
var fs = require('fs');

function path(file){
    return 'data/' + file;
}

exports.loadAccount = function (callback) {
    fs.readFile(path('account.json'), function (err, data) {
        var account = JSON.parse(data);
        callback(account);
    });
}

exports.loadGeneralInfo = function (callback) {
    fs.readFile(path('general-info.json'), function (err, data) {
        var generalInfo = JSON.parse(data);
        callback(generalInfo);
    });
}

exports.saveGeneralInfo = function (info, featureImageTmpPath, callback) {
    fs.writeFile(path('general-info.json'), JSON.stringify(info), function (err) {
        if(err){
            callback(err);
            return;
        }
        if(featureImageTmpPath) {
            fs.rename(featureImageTmpPath, 'public/feature.jpg', callback);
            return;
        }
        callback(false);
    });
}

exports.loadAbout = function (callback){
    fs.readFile(path('about.txt'), function (err, data){
        callback(data);
    });
}

exports.saveAbout = function (text, callback){
    fs.writeFile(path('about.txt'), text, callback);
}

function loadProduct(productID, filePath, callback){
    fs.readFile(filePath, function (err, data) {
        var product = JSON.parse(data);
        product.id = productID;
        callback(product);
    });
}

function getProductsFolder() {
    return path('products');
}

function parseProductID(jsonFileName) {
    var idString = jsonFileName.substring(0, jsonFileName.length - 5);
    return parseInt(idString);
}

function sortProducts(products){
    for (let index = 0; index < products.length - 1; index++) {
        for (let index2 = index + 1; index2 < products.length; index2++) {
            if(products[index].id > products[index2].id){
                var tmp = products[index];
                products[index] = products[index2];
                products[index2] = tmp;
            }            
        }
        
    }
}

exports.loadProducts = function (callback) {
    var folder = getProductsFolder();

    fs.readdir(folder, function (err, files) {
        var count = 0;
        var total = files.length;
        var products = [];

        for (let index = 0; index < total; index++) {
            var filePath = folder + '/' + files[index];
            var productID = parseProductID(files[index]);

            loadProduct(productID, filePath, function (product) {
                products.push(product);
                ++count;
                if(count == total){
                    sortProducts(products);
                    callback(products);
                }
            });
        }
    });
}

function getNewProductId(folder, callback) {
    fs.readdir(folder, function (err, files) {
        var max = 0;
        for (let index = 0; index < files.length; index++) {
            var productID = parseProductID(files[index]);
            if(productID > max){
                max = productID;
            }
        }
        callback(max + 1);
    });
}

exports.addProduct = function (editProductId, name, imageTmpPath, callback) {
    var folder = getProductsFolder();

    var saveProduct = function (id) {
        var product = {name: name}
        fs.writeFile(
            folder + '/' + id + '.json', 
            JSON.stringify(product), 
            function (err) {
                if(err){
                    callback(err);
                    return;
                }
                if(imageTmpPath != '')
                    fs.rename(imageTmpPath, 'public/images/products/' + id + '.jpg', callback);
                else
                    callback(false);
        });
    }
    if(editProductId == 0)
        getNewProductId(folder, saveProduct);
    else
        saveProduct(editProductId);
}

exports.loadSingleProduct = function (productId, callback) {
    var productFilePath = getProductsFolder() + '/' + productId + '.json';
    loadProduct(productId, productFilePath, callback);
}

exports.deleteProduct = function (productId, callback) {
    fs.unlink(getProductsFolder() + '/' + productId + '.json', function (err) {
        if(err){
            callback(err);
            return;
        }
        fs.unlink('public/images/products/' + productId + '.jpg', callback);
    });
}