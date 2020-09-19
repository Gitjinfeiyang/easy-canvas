const THEME = {
    PRIMARY:'#409eff',
    SUCCESS:'#67c23a',
    INFO:'#909399',
    WARNING:'#e6a23c',
    ERROR:'#f56c6c'
}
const PLAIN_THEME = {
    PRIMARY:'#ecf5ff',
    SUCCESS:'#f0f9eb',
    INFO:'#f4f4f5',
    WARNING:'#fdf6ec',
    ERROR:'#fef0f0'
}

function Block(c,{title,description,content},id){
    return c('view',{
        styles:{
            marginBottom:20,
            padding:20
        },
        attrs:{
            id
        }
    },[
        c('view',{
            color:'#1f2f3d',
            marginBottom:8
        },[c('text',{styles:{fontSize:28,}},title)]),
        c('view',{
            styles:{
                color:'#5e6d82',
                marginBottom:8
            }
        },[c('text',{},description)]),
        c('view',{},content || [])
    ])
}

function Line(c,content){
    return c('view',{
        styles:{marginBottom:10},
    },content)
}

// 按钮组件
function Button(c,{attrs,styles,on},content){
    let _styles = Object.assign({
        backgroundColor:THEME[attrs.type.toUpperCase() || 'info'],
        display:'inline-block',
        borderRadius:2,
        color:'#fff',
        lineHeight:40,
        padding:[0,20]
    },styles||{})

    if(attrs.plain){
        _styles.color = THEME[attrs.type.toUpperCase()]
        _styles.borderWidth = 0.5
        _styles.borderColor = THEME[attrs.type.toUpperCase()]
        _styles.backgroundColor = PLAIN_THEME[attrs.type.toUpperCase() || 'info']
    }

    if(attrs.round){
        _styles.borderRadius = 20
    }

    return c('view',{
        attrs:Object.assign({

        },attrs||{}),
        styles:_styles,
        on:on||{},
    },typeof content === 'string'?[c('text',{},content)]:content)
}

function Radio(c,{attrs,styles,on},content){
    return c('view',{

    },[
        c('view',{styles:{}},[
            c('view',{
                styles:{
                    width:14,
                    height:14,
                    borderRadius:7,
                    borderColor:THEME.PRIMARY,
                    borderWidth:4,
                    display:'inline-block',
                }
            }),
            c('text',{styles:{
                marginLeft:6,
                color:'#606266'
            }},'radio')
        ])
    ])
}