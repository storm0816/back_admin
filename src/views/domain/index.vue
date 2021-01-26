<template>
  <div class="app-container">
    <!-- 条件查询 -->
    <el-form :inline="true" :model="query" size="mini">
      <el-form-item label="域名：">
        <el-input v-model.trim="query.name" />
      </el-form-item>
      <el-form-item label="项目名称：">
        <el-select v-model="query.itemId" clearable filterable>
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

    <!-- stripe 带斑马纹 -->
    <el-table
      :data="list"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column align="center" type="index" label="序号" width="60" />
      <el-table-column align="center" prop="name" label="域名" />
      <el-table-column align="center" prop="itemName" label="项目名" />
      <el-table-column align="center" prop="cname" label="CNAME" />
      <el-table-column align="center" prop="elb" label="负载均衡" />
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-popover
            placement="right"
            width="350"
            trigger="click"
          >
            <el-table :data="assetList">
              <el-table-column width="150" property="hostname" label="主机名" />
              <el-table-column width="150" property="lanip" label="内网IP" />
            </el-table>
            <el-button slot="reference" type="primary" size="mini" @click="getDomainAndAssetList(scope.row.id)">查看设备列</el-button>
            <el-button slot="reference" type="success" size="mini" @click="handleEdit(scope.row.id,scope.row.itemId)">编辑</el-button>
            <el-button slot="reference" type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
          </el-popover>
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

    <edit :title="edit.title" :visible="edit.visible" :selasset-list="selassetList" :item-list="itemList" :form-data="edit.formData" :remote-close="remoteClose" />
  </div>
</template>

<script>
import api from '@/api/domain'

import itemApi from '@/api/item'

import Edit from './edit'

export default {
  name: 'Domain', // 和对应路由表中配置的name值一致
  components: {
    Edit // Edit: Edit
  },

  data() {
    return {
      list: [], // 列表数据

      itemList: [], // 项目列表

      assetList: [], // 设备列表

      selassetList: [], // 打开编辑后获取对应项目的设备列表

      page: { // 分页对象
        current: 1, // 当前页码
        size: 20, // 每页显示多少条
        total: 0 // 总记录数
      },

      query: {}, // 查询条件

      edit: {
        title: '',
        visible: false,
        formData: {}
      }
    }
  },

  created() {
    this.fetchData()
    this.getItemList()
  },

  methods: {
    fetchData() {
      api.getList(this.query, this.page.current, this.page.size).then(response => {
        // console.log('response', response)
        // 列表数据
        this.list = response.data.records
        this.page.total = response.data.total
      })
    },

    getItemList() {
      itemApi.getNormalList().then(response => {
        this.itemList = response.data
        // console.log('this.itemList ', this.itemList )
      })
    },

    getDomainAndAssetList(id) {
      // 通过id查询详情
      api.getDomainAndAssetList(id).then(response => {
        if (response.code === 20000) {
          // 将查询的详情传递

          this.assetList = response.data.assetList
        }
      })
    },

    handleEdit(id, itemId) {
      // 通过id查询详情
      itemApi.getSelAssetList(itemId).then(response => {
        if (response.code === 20000) {
          // 将查询的详情传递
          this.selassetList = response.data
        }
      })
      api.getById(id).then(response => {
        if (response.code === 20000) {
          // 将查询的详情传递
          this.edit.formData = response.data
          this.edit.title = '编辑'
          this.edit.visible = true
        }
      })
    },

    handleDelete(id) {
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
      // 将页码变为1，第1页
      this.page.current = 1
      this.fetchData()
    },
    // 重置
    reload() {
      this.query = {}
      this.fetchData()
    },
    // 子组件会触发此事件方法来关闭窗口
    remoteClose() {
      this.edit.formData = {}
      this.edit.visible = false
      this.fetchData()
    },
    // 打开新增窗口
    openAdd() {
      this.edit.visible = true
      this.edit.title = '新增'
    }
  }
}
</script>
