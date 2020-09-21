const THEME = {
  PRIMARY: '#409eff',
  SUCCESS: '#67c23a',
  INFO: '#909399',
  WARNING: '#e6a23c',
  ERROR: '#f56c6c'
}
const PLAIN_THEME = {
  PRIMARY: '#ecf5ff',
  SUCCESS: '#f0f9eb',
  INFO: '#f4f4f5',
  WARNING: '#fdf6ec',
  ERROR: '#fef0f0'
}

function Block(c, { title, description, content }, id) {
  return c('view', {
    styles: {
      marginBottom: 20,
      padding: 20
    },
    attrs: {
      id
    }
  }, [
    c('view', {
      color: '#1f2f3d',
      marginBottom: 12
    }, [c('text', { styles: { fontSize: 28, } }, title)]),
    c('view', {
      styles: {
        color: '#5e6d82',
        marginBottom: 14
      }
    }, [c('text', {}, description)]),
    c('view', {
    }, content || [])
  ])
}

function Line(c, content) {
  return c('view', {
    styles: { marginBottom: 10 },
  }, content)
}

// 按钮组件
function Button(c, { attrs, styles, on }, content) {
  let _styles = Object.assign({
    backgroundColor: THEME[attrs.type.toUpperCase() || 'info'],
    display: 'inline-block',
    borderRadius: 2,
    color: '#fff',
    lineHeight: 40,
    padding: [0, 20]
  }, styles || {})

  if (attrs.plain) {
    _styles.color = THEME[attrs.type.toUpperCase()]
    _styles.borderWidth = 0.5
    _styles.borderColor = THEME[attrs.type.toUpperCase()]
    _styles.backgroundColor = PLAIN_THEME[attrs.type.toUpperCase() || 'info']
  }

  if (attrs.round) {
    _styles.borderRadius = 20
  }

  return c('view', {
    attrs: Object.assign({

    }, attrs || {}),
    styles: _styles,
    on: on || {},
  }, typeof content === 'string' ? [c('text', {}, content)] : content)
}

function RadioGroup(c, { attrs, styles, on }, content) {
  let value = attrs.value
  let selected = null
  const onItemClick = item => {
    selected && selected.setStyles({
      borderColor: '#ccc',
      borderWidth: 0.5
    })
    item.setStyles({
      borderColor: THEME.PRIMARY,
      borderWidth: 4,
    })
    value = item.options.attrs.value
    selected = item
    // call on change
    attrs.on && attrs.on.onChange && attrs.on.onChange(item.options.attrs.value)
  }

  const _radioGroup = c('view', {

  },
    attrs.options.map(item => c('view', { styles: { display: 'inline-block', marginRight: 10 } }, [
      c('view', {
        attrs: {
          value: item.value
        },
        styles: {
          width: 14,
          height: 14,
          borderRadius: 7,
          display: 'inline-block',
          borderColor: '#ccc',
          borderWidth: 0.5
        },
        on: {
          click(e) {
            onItemClick(this)
          }
        }
      }),
      c('text', {
        styles: {
          marginLeft: 6,
          color: '#606266'
        }
      }, item.label)
    ])
    )
  )
  return _radioGroup
}

function Select(c,{attrs,styles,on}){
  let showSelect = false
  const SelectPanel = c('view',{
    styles:{
      width:'100%',
      // position:'absolute',
      // top:44,
      // left:0,
      height:200,
      borderColor:'#f1f1f1',
      borderRadius:2,
      borderWidth:0.5
    },
  },
  attrs.options.map(item => {
    return c('view',{
      styles:{
        padding:10
      }
    },[c('text',{},item.label)])
  })
  )
  const toggleSelect = (target) => {
    if(showSelect){
      SelectPanel.remove()
    }else{
      target.appendChild(SelectPanel)
    }
    showSelect = !showSelect
  }
  return c('view',{
    styles:{
      width:100,
      position:'relative'
    },
    on:{
      click(){
        toggleSelect(this)
      }
    }
  },[
    c('view',{
      styles:{
        lineHeight:40,
        color:'#666',
        borderColor:'#f1f1f1',
        borderWidth:0.5,
        borderRadius:2,
        padding:[0,10]
      }
    },[c('text',{styles:{maxLine:1}},'label label labellabel')]),
  ])
}
