<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表区 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <!-- 内容列 -->
        <!-- 这个prop="roleName"其实就是rolelist.roleName -->
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 点击编辑和删除后都会调用两个方法，编辑会先传id过去查询再修改，删除直接传id过去就删除了 -->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form :model="editForm" ref="editFormRef" label-width="70px">
          <el-form-item label="角色名称">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>

          <el-form-item label="角色操作">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 添加用户的对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%">
        <!-- 内容主体区 -->
        <el-form :model="addForm" label-width="70px">
          <el-form-item label="角色名称">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>

          <el-form-item label="角色操作">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>

        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="adduser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslists"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      >
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表的储存区
      rolelist: [],
      // 控制修改对话框显示和隐藏
      editDialogVisible: false,
      // 控制添加角色对话框的显示和隐藏
      addDialogVisible: false,
      // 控制分配权限对话框的显示和隐藏
      setRightDialogVisible: false,
      // 查询到的用户信息对象储存区
      editForm: {},
      // 所有权限的数据
      rightslists: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点的id值
      defkeys: [],
      // 这是添加用户的表单数据
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },

  // 定义一个生命周期函数来初始化角色列表
  created () {
    this.getRoleslist()
  },

  // 方法体
  methods: {
    //   获取角色列表的方法
    async getRoleslist () {
      const { data: res } = await this.$http.get('roles')
      //   console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      //   放到所有角色列表中rolelist
      this.rolelist = res.data
    },
    // 重置修改对话框方法(但是因为我没写校验规则所以可有可无)
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击编辑后给editForm赋值,给修改对话框渲染上值
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('查询信息失败！')
      }

      this.editForm = res.data

      this.editDialogVisible = true
      // console.log(id)
    },
    // 具体的修改方法
    async editUserInfo (id) {
      const { data: res } = await this.$http.put(
        'roles/' + this.editForm.roleId,
        {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        }
      )
      // console.log('看id' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('更新用户信息失败')
      }

      // 关闭对话框
      this.editDialogVisible = false
      // 刷新数据
      this.getRoleslist()
      // 提示修改成功
      this.$message.success('更新用户数据成功！')
    },
    // 具体的删除方法
    async removeUserById (id) {
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

      const { data: res } = await this.$http.delete('roles/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }

      this.$message.success('删除用户成功！')
      this.getRoleslist()
    },
    // 点击确定按钮，添加新用户
    async adduser () {
      // console.log(this.addForm)
      const { data: res } = await this.$http.post('roles', this.addForm)
      if (res.meta.status !== 201) {
        this.$message.error('添加用户失败')
      }
      this.$message.success('添加用户成功')

      this.addDialogVisible = false
      this.getRoleslist()
    },
    // 根据id删除对应权限
    // 那个删除圆圈绑定（close）的方法
    async removeRightById (role, rightId) {
      // 弹框提示是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作！')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      this.$message.success('删除权限成功！')
      // this.getRoleslist() 不建议这样刷新因为会关闭掉那个展开框，所以下面这个
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 获取所以权限数据
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }

      // 获取到的权限数据保存到data中
      this.rightslists = res.data
      // 看看是否获取到了
      // console.log(this.rightslists)

      // 递归获取三级节点的id
      // 方法在下面
      this.getLeafkeys(role, this.defkeys)
      // console.log('测试1' + role)

      this.setRightDialogVisible = true
    },
    // 通过递归函数的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
    getLeafkeys (node, arr) {
      // console.log('测试2' + node)
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      // 递归
      node.children.forEach(item => this.getLeafkeys(item, arr))
    },
    // 监听分配对话框关闭事件
    setRightDialogClosed () {
      this.defkeys = []
    },
    // 分配权限对话框的确定按钮绑定的方法
    async allotRights () {
      const keys = [
        // 树桩控件的引用treeRef
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')

      this.getRoleslist()

      // 关闭对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
// 按钮间的间隔
.el-tag {
  margin: 7px;
}
// 上边框线
.bdtop {
  border-top: 1px solid #eee;
}
// 下边框线
.bdbottom {
  border-bottom: 1px solid #eee;
}
// 居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>
