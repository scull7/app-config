/**
 * A library to allow a user to load a layered XML configuration.
 */

var _			= require('underscore'),
	fs			= require('fs'),
	xml2js		= require('xml2js'),
	uquery		= require('uquery'),
	DotNotation	= require('./dot-notation')
;
/**
 * The configuration object that is returned from the load function.
 */
function Config(data) {
	/**
	 * This is the configuration object store.
	 * @type {Object.<string,*>}
	 */
	this.config	= data;
}

/**
 * Get the configuration value that corresponds to the given dot "." separated
 * key.
 * @param {string} key
 * @param {*} def = a default value.
 * @return {*}
 */
Config.prototype	= {
	getValue: function(key, def) {
		var value	= DotNotation.accessor(key, this.config);
		
		if (value === null && typeof def !== 'undefined') {
			value	= def;
		}
		return value;
	}
};

/**
 * Load all the configurations.
 * @param {string} config_path - the base configuration file path.
 * @param {string} config_file - name of the base configuratio file.
 * @param {function():boolean} callback
 */
exports.load	= function (config_path, config_file, callback) {
	var self		= this,
		config_data	= [],
		parser		= new xml2js.Parser()
	;
		
	parser.addListener('end', function (result) {
		if (!result.config) {
			throw "Invalid base configuration file.";
		}
		if (result.config.length < 1) {
			throw "You must specifiy at least one configuration file.";
		}
		
		/**
		 * This function is called after all of the configuration files have
		 * been read.
		 */
		var complete	= _.after(result.config.length, function () {
			var complete_config	= {};
			config_data.unshift(complete_config);
			config_data.unshift(true);
			uquery.merge.apply(uquery.merge, config_data);
			self.config	= complete_config;
			
			self.emit('complete', self, complete_config);
			callback(self, complete_config);
			
		});
		
		_.each(result.config, function (setting, index) {
			fs.readFile(config_path + '/' + setting.file, function (error, data) {
				if (error) {
					throw error;
				}
				var sub_parser	= new xml2js.Parser();
				sub_parser.addListener('end', function (result) {
					config_data[index]	= result;
					complete();
				});
				sub_parser.parseString(data);
			});
		});
	});
	
	fs.readFile(config_path + '/' + config_file, function (error, data) {
		if (error) {
			throw "Unable to read base configuration file. (" + config_path + "/" + config_file + ")";
		}
		parser.parseString(data);
	});
};