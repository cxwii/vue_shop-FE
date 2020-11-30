<template>
  <div>
    <!-- 这是用户列表组件 -->

    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTabl"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效的模板，就那个√x那个图标 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>

          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditshanchu(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form :model="editForm" label-width="70px">

        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>

      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {

      // 修改用的保存数据
      editForm: {},
      // 修改对话框的显示和隐藏
      editDialogVisible: false,
      // 商品分类的数据列表，默认为空
      catelist: [],

      // 查询参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },

      // 总数据条数
      total: 0,

      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示，当前列定义为模板
          type: 'template',
          // 表示，当前列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示，当前列定义为模板
          type: 'template',
          // 表示，当前列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示，当前列定义为模板
          type: 'template',
          // 表示，当前列使用的模板名称
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加分类的名称
        cat_name: '',
        // 父类分类的id
        cat_pid: 0,
        // 分类的等级，默认为一级分类
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        // 选中的值
        value: 'cat_id',
        // 看到的值
        label: 'cat_name',
        // 父子嵌套的属性
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },

  created () {
    // 获取商品分类数据
    this.getCateList()
  },

  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败！')
      }

      // 把数据列表赋值给catelist(因为data里面的result才是需要的数据)
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },

    // 下面那两个是分页页码的方法
    // 监听pagesize
    handleSizeChange (newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum
    handleCurrentChange (newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类按钮的绑定方法
    showAddCateDialog () {
      // 获取父级分类的数据列表
      this.getParentCateList()
      // 展示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged () {
      // console.log(this.selectedKeys)

      // 如果selectedkeys数组中的length大于0，证明选中有父级分类
      // 没有就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类的确定按钮绑定的方法
    addCate () {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框关闭事件，重置表单数据
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },

    // 删除方法
    async showEditDialog (id) {
      // 删除的提示和确认
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

      // 删除的具体方法
      const { data: res } = await this.$http.delete('categories/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败!')
      }

      this.$message.success('删除用户成功败！')
      this.getCateList()
    },

    // 给修改赋值
    async showEditshanchu (id) {
      const { data: res } = await this.$http.get('categories/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('查询信息失败！')
      }

      this.editForm = res.data

      this.editDialogVisible = true
    },

    // 具体的修改
    async editUserInfo () {
      const { data: res } = await this.$http.put(
        'categories/' + this.editForm.cat_id,
        {
          cat_name: this.editForm.cat_name
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('更新用户信息失败')
      }

      // 关闭对话框
      this.editDialogVisible = false
      // 刷新数据
      this.getCateList()
      // 提示修改成功
      this.$message.success('更新用户数据成功！')
    }
  }
}
</script>

<style lang="less" scoped>
.treeTabl {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
