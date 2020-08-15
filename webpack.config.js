const path=require("path")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
process.env.mode = 'development'

module.exports={
    entry:'./src/draw/index.js',
    output:{
        path:path.resolve(__dirname,'./dist'),
        filename:'easyFlow.min.js'
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress:false,
          },
          cache: true,
          include:path.resolve(__dirname,'../src')
        })
      ]
    },
    plugins:[
        
    ],
    resolve: {
        extensions: [ '.ts', '.js']
    },
    module:{
        rules:[
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: "style-loader"
                        }, {
                            loader: "css-loader"
                        }
                    ]
                  },
                  {
                      test:/\.ts$/,
                           exclude: /(node_modules|bower_components)/,
                      use:[{
                              loader: 'babel-loader',
                              // options: {
                              //   presets: ['es5']
                              // }
                            },
                          {loader:'ts-loader'},
                           
                      ],
                  }
        ]
    }
}