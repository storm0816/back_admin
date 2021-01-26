<template>
  <div class="app-container">

    <!-- 条件查询 -->
    <el-form :inline="true" :model="query" size="mini">
      <el-form-item label="角色名称：">
        <el-input v-model.trim="query.name" />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button>
        <el-button icon="el-icon-refresh" @click="reload">重置</el-button>
        <el-button v-if="!roleIds" icon="el-icon-circle-plus-outline" type="primary" @click="openAdd">新增</el-button>

        <el-button v-if="roleIds" icon="el-icon-circle-plus-outline" type="success" @click="handleUserRole">设置角色</el-button>
      </el-form-item>
    </el-form>

    <el-table
      ref="dataTable"
      :data="list"
      stripe
      border
      style="width: 100%"
      row-key="id"
      @selection-change="handleSelectionChange"
    >
      <!-- reserve-selection必须配合上面的row-key使用，这样可以在切换页码后，保留前面选中的行 -->
      <!-- 多选 -->
      <el-table-column align="center" reserve-selection type="selection" width="55" />

      <el-table-column align="center" type="index" label="序号" width="60" />
      <el-table-column align="center" prop="name" label="角色名称" />
      <el-table-column align="center" prop="remark" label="备注" />
      <!--roleIds如果有值，则是用户管理组件传递过来了，则把操作列隐藏  -->
      <el-table-column v-if="!roleIds" align="center" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handlePermission(scope.row.id)">分配权限</el-button>
          <el-button type="success" size="mini" @click="handleEdit(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      :current-page="page.current"
      :page-sizes="[10, 20, 50]"
      :page-size="page.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="page.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <edit :title="edit.title" :visible="edit.visible" :form-data="edit.formData" :remote-close="remoteClose" />

    <!-- 设置权限组件 -->
    <permission
      title="分配权限"
      :visible="per.visible"
      :remote-close="remotePerClose"
      :role-id="per.roleId"
    />
  </div>
</template>
<script>

import api from '@/api/role'

import Edit from './edit'
import Permission from './permission'

export default {
  name: 'Role', // 和对应路由表中配置的name值一致

  components: { Edit, Permission },

  // 当用户管理模块, 将当前这个组件文件作为子组件时,进行接收父组件传递过来的属性
  props: {
    roleIds: null
  },

  data() {
    return {
      list: [],
      page: {
        current: 1,
        size: 20,
        total: 0
      },
      query: {},

      edit: {
        title: '',
        visible: false,
        formData: {}
      },

      per: { // 分配权限子组件属性
        visible: false,
        roleId: null // 角色id
      },

      checkedRoleList: [] // 存储选中的对象
    }
  },

  watch: {
    roleIds() {
      this.query = {} // 将查询条件清空
      this.queryData() // 重新获取数据，注意这个方法是查询第1页
    }
  },

  created() {
    this.fetchData()
  },

  methods: {
    fetchData() {
      api.getList(this.query, this.page.current, this.page.size).then(response => {
        this.list = response.data.records
        this.page.total = response.data.total
        console.log('刷新列表数据')
        //    列表有数据后，勾选角色
        this.chekedRoles()
      })
    },

    // 勾选角色
    chekedRoles() {
      // 强调：在el-table组件中一定要加上 ref="dataTable"
      // 清空上一次选择
      this.$refs.dataTable.clearSelection()
      if (this.roleIds) {
        // 循环出查询到每个角色数据，要进行判断父组件组件的roleIds中的每个角色对象
        this.list.forEach(item => {
          // 匹配到了，则应该选中
          if (this.roleIds.indexOf(item.id) !== -1) {
            // 选中，对应传递的是角色对象
            this.$refs.dataTable.toggleRowSelection(item, true)
          }
        })
      }
    },

    // 编辑
    async handleEdit(id) {
      // 查询详情
      const { data } = await api.getById(id)
      this.edit.formData = data
      // 弹出窗口
      this.edit.title = '编辑'
      this.edit.visible = true
    },

    // 删除
    handleDelete(id) {
      this.$confirm('确认删除这条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 发送删除请求
        api.deleteById(id).then(response => {
          // 处理响应结果提示
          console.log(response)
          this.$message({
            type: response.code === 20000 ? 'success' : 'error',
            message: response.message
          })
          // 刷新列表数据
          this.fetchData()
        })
      }).catch(() => {
        // 取消删除，不用理会
      })
    },

    // val 是切换之后的每页显示多少条
    handleSizeChange(val) {
      this.page.size = val
      this.fetchData()
    },

    // 当页码改变后触发到此方法，val 是当前点击（或输入）的那个页码，
    handleCurrentChange(val) {
      this.page.current = val
      this.fetchData()
    },

    // 条件查询
    queryData() {
      this.page.current = 1
      this.fetchData()
    },

    reload() {
      this.query = {}
      this.fetchData()
    },

    // 新增
    openAdd() {
      this.edit.visible = true
      this.edit.title = '新增'
    },

    // 关闭弹窗
    remoteClose() {
      this.edit.formData = {}
      this.edit.visible = false
      this.fetchData()
    },

    // 分配权限
    handlePermission(id) {
      // 将点击的那个角色id传递给子组件, 进行查询当前角色已经拥有的菜单ids
      this.per.roleId = id
      this.per.visible = true
    },
    // 关闭分配权限弹窗
    remotePerClose() {
      this.per.visible = false
      this.per.roleId = null
      this.fetchData()
    },

    // 收集被选中的角色
    handleSelectionChange(val) {
      // console.log("收集被选中的角色", val)
      // val ： 是选中的每个对象，将选中的每一个对象封装到这个val数组中
      this.checkedRoleList = val
    },

    // 点击设置角色按钮触发 的
    handleUserRole() {
      // 存放选中的角色id
      const checkedRoleIds = []
      // 获取每个元素中的角色id, 因为调用保存用户角色接口，只需要选中的角色id
      this.checkedRoleList.forEach(item => {
        checkedRoleIds.push(item.id)
      })

      // 触发父组件的事件函数
      this.$emit('saveUserRole', checkedRoleIds)
    }

  }

}
</script>
