<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        show-icon
        title="注意：只允许为第三级分类设置相关参数!"
        type="warning"
        :closable="false"
      ></el-alert>

      <!-- 商品分类区域 -->
      <el-row class="cat_pot">
        <el-col>
          <span>选择商品分类：</span>

          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            :options="catelist"
            :props="cateProps"
            v-model="selectedCatekeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabked"
            @click="addDialogVisible = true"
          >
            添加参数
          </el-button>

          <!-- 动态参数列表 -->
          <el-table :data="manyTableData" bordeer stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">

                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>

                <!-- 输入框和按钮的变化 -->

                <!-- 输入的 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>

                <!-- 按钮的 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button>

              </template>
            </el-table-column>

            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作" prop="attr_name">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  inco="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  inco="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态参数的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabked"
            @click="addDialogVisible = true"
          >
            添加属性
          </el-button>

          <!-- 静态参数列表 -->
          <el-table :data="onlyTableData" bordeer stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">

                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                >
                  {{ item }}
                </el-tag>

                <!-- 输入框和按钮的变化 -->

                <!-- 输入的 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>

                <!-- 按钮的 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button>

              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作" prop="attr_name">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  inco="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="danger"
                  inco="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的通用对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数的对话框 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <!-- 操作区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 添加参数的对话框 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <!-- 操作区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },

      // 级联选择框绑定的数组
      selectedCatekeys: [],

      // 这是被激活的页签的名字
      activeName: 'many',

      // 动态参数数据
      manyTableData: [],

      // 静态属性数据
      onlyTableData: [],

      // 控制添加参数的显示和隐藏
      addDialogVisible: false,

      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },

      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },

      // 修改对话框的显示和隐藏
      editDialogVisible: false,

      // 修改的表单数据对象
      editForm: {},

      // 修改的验证规则
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }

    }
  },

  created () {
    this.getCateList()
  },

  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }

      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择框选择项变化，会触发这个方法@change
    handleChange () {
      this.getParamsData()
    },

    // 这是tab页签点击事件的处理函数
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsData()
    },

    // 获取参数的列表数据
    async getParamsData () {
      // 让其只能选择三级分类
      if (this.selectedCatekeys.length !== 3) {
        this.selectedCatekeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      console.log(this.selectedCatekeys)

      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }

      // console.log(res.data)
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []

        // 控制文本框的显示和隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputVisible = ''
      })

      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    // 监听添加对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },

    // 对话框的确定绑定事件,点击添加参数
    addParams () {
      // 表单的预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return

        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }

        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 编辑绑定的方法
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 监听修改对话框关闭事件，并清空
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },

    // 修改的确定按钮
    editParams () {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const {
          data: res
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败!')
        }

        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },

    // 删除绑定事件
    async removeParams (id) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      // 上面等效于下面
      // .catch(err => {
      //   return err
      // })

      // 用户取消操作返回cancel
      // 用户确认操作返回confirm
      // console.log(confirmResult)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }

      this.$message.success('删除参数成功！')

      this.getParamsData()
    },

    // 文本框失去焦点或按下回车都会触发
    async handleInputConfirm (row) {
      // console.log('OK')

      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      row.attr_vals.push(row.inputValue.trim())

      row.inputValue = ''
      row.inputVisible = false

      // 需要发起请求来保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },

    // 发起请求的打包方法,主要是将对attr_vals的操作保存到数据库
    async saveAttrVals (row) {
      // 需要发起请求来保存这次操作
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },

    // 点击按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true

      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    // 删除展开列里的方法
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }

  },
  // 计算属性
  computed: {
    // 按钮禁用的效果
    isBtnDisabked () {
      if (this.selectedCatekeys.length !== 3) {
        return true
      }

      return false
    },

    // 当前选中的三级分类的id
    cateId () {
      if (this.selectedCatekeys.length === 3) {
        return this.selectedCatekeys[2]
      }

      return null
    },

    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }

      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_pot {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 100px;
}
</style>
