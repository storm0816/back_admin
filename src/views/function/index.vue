<template>
  <div class="app-container">
    <!-- 条件查询 -->
    <el-form :inline="true" :model="query" size="mini">
      <el-form-item label="功能名称：">
        <el-input v-model.trim="query.name" />
      </el-form-item>
      <el-form-item label="项目名称：">
        <el-select v-model="query.itemId" clearable filterable @clear="handleClear">
          <el-option
            v-for="item in itemList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="queryData">查询</el-button>
        <el-button icon="el-icon-refresh" @click="reload">重置</el-button>
        <el-button icon="el-icon-circle-plus-outline" type="primary" @click="openAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="list"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column align="center" type="index" label="序号" width="60" />
      <el-table-column align="center" prop="name" label="功能名称" />
      <el-table-column align="center" prop="itemName" label="项目名称" />
      <el-table-column align="center" prop="path" label="安装路劲" />
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
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

    <!--  新增或编辑组件 -->
    <edit
      :title="edit.title"
      :visible="edit.visible"
      :form-data="edit.formData"
      :remote-close="remoteClose"
      :item-list="itemList"
    />
  </div>
</template>
<script>

import api from '@/api/function'
import itemApi from '@/api/item'

import Edit from './edit'

export default {
  name: 'Function', // 和对应路由表中配置的name值一致

  components: { Edit },

  data() {
    return {
      list: [], // 封装列表数据

      page: { // 分页对象
        current: 1,
        size: 20,
        total: 0
      },

      query: {}, // 条件查询

      itemList: [], // 正常状态的分类
      edit: { // 子组件引用属性对象
        title: '',
        visible: false,
        formData: {}
      }
    }
  },

  created() {
    this.fetchData()
    // 获取 正常 状态的分类列表数据
    this.getItemList()
  },

  methods: {
    fetchData() {
      api.getList(this.query, this.page.current, this.page.size).then(response => {
        this.list = response.data.records
        this.page.total = response.data.total
      })
    },
    // 清空select后，重新刷新
    handleClear() {
      this.fetchData()
    },

    handleEdit(id) {
      // console.log('编辑', id)
      api.getById(id).then(response => {
        if (response.code === 20000) {
          this.edit.formData = response.data
          // 弹出窗口
          this.edit.visible = true
          this.edit.title = '编辑'
        }
      })
    },

    handleDelete(id) {
      // console.log('删除', id)
      this.$confirm('确认删除这条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 发送删除请求
        api.deleteById(id).then(response => {
          // 处理响应结果提示
          this.$message({
            type: response.code === 20000 ? 'success' : 'error',
            message: response.message
          })
        })
        // 刷新列表数据
        this.fetchData()
      }).catch(() => {
        // 取消删除，不用理会
      })
    },

    // 每页显示多少条改变后触发
    handleSizeChange(val) {
      this.page.size = val
      this.fetchData()
    },
    handleCurrentChange(val) {
      this.page.current = val
      this.fetchData()
    },

    // 获取 正常 状态的分类列表数据
    getItemList() {
      itemApi.getNormalList().then(response => {
        this.itemList = response.data
        // console.log('this.itemList ', this.itemList )
      })
    },

    // 条件查询
    queryData() {
      // 将页码变为第1页
      this.page.current = 1
      this.fetchData()
    },

    // 重置
    reload() {
      this.query = {}
      this.fetchData()
    },

    // 打开新增窗口
    openAdd() {
      // 打开时，重新查询正常状态的分类数据
      // this.getItemList()
      this.edit.visible = true
      this.edit.title = '新增'
    },

    // 关闭弹窗
    remoteClose() {
      this.edit.formData = {}
      this.edit.visible = false
      this.fetchData()
    }

  }
}
</script>
