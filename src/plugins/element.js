import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'
// 导入的弹框提示(上面的Message,这里不知道为什么不能用下面这种方式了)
// import { Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)

// 挂载的弹框提示
Vue.prototype.$message = Message
