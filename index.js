/**
 * A library to allow a user to load a layered XML configuration.
 */
 
var _			= require('underscore'),
	fs			= require('fs'),
	xml2js		= require('xml2js'),
	DotNotation	= require('./dot_notation'),
	
	/**
	 * This is the path that will be used for the configuration files.  
	 * You can provide this path as an environment variable using: 
	 * export APP_CONFIG_PATH=my/fun/path
	 * @type {string}
	 */
	config_path	= process.env.APP_CONFIG_PATH || null;
	
	/**
	 * This is the base configuration file that will be loaded.
	 * @type {string}
	 */
	base_config	= 'config.xml';
	
function Config(data) {
	/**
	 * this is the configuration object store.
	 * @type {Object.<string, *>}
	 */
	this.config	= data;
}
/**
 * Get the configuration value that corresponds to the given 
 * dot "." separated key.
 * @param {string} key
 * @param {*} def - a default value
 * @return {*}
 */
Config.prototype.getValue(key, def) {
	var value	= DotNotation.accessor(key, this.config);
	
	if (value === null & def) {
		value	= def;
	}
	return value;
}

/**
 * Load all the configurations.
 * @param {string} config_path
 * @param {function():boolean} callback
 */
exports.load	= function (user_config_path, callback) {
	if (user_config_path) {
		config_path	= user_config_path;
	}
	var self		= this,
		config_data	= [],
		parser		= new xml2js.Parser();
	
	parser.addListener('end', function (result) {
		if (!result.config) {
			throw "Invalid base configuration file.";
		}
		if (result.config.length < 1) {
			throw "You must specify at least one configuration file."
		}
	}
	
	var complete	= _.after(result.config.length, function () {
		var complete_config	= {};
		config_data.unshift(complete_config);
		_.extend.apply(_.extend, config_data);
		
		return new Config(complete_config);
	});
}



