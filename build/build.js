const webpack=require("webpack");
const defaultConfig=require("./webpack.config");

webpack(defaultConfig).run(function(err,stats){
	if(err) throw err;
	process.stdout.write(stats.toString())
})