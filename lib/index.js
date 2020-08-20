
import { createElement, createLayer, registerComponent } from './create-element'
import px from './px'
import './weapp-adapter'
import View from './view'
import Text from './text'
import Image from './image'
import Layer from './layer'
import ScrollView from './scroll-view'


const ef = {
  createLayer,
  createElement,
  component: registerComponent,
  View,
  Text,
  Image,
  Layer,
  ScrollView
}

let _global = window || global
if (_global) {
  _global.easyFlow = ef
}



export default ef

