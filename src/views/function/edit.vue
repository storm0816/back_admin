<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="400px"
    :before-close="handleClose"
  >
    <el-form
      ref="formData"
      :rules="rules"
      :model="formData"
      label-width="100px"
      label-position="right"
      style="width: 300px"
      status-icon
    >
      <el-form-item label="功能名称：" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="项目名称：" prop="itemId">
        <el-select v-model="formData.itemId" clearable filterable>
          <el-option
            v-for="item in itemList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="安装路劲" prop="path">
        <el-input v-model="formData.path" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="submitForm('formData')">确定</el-button>
        <el-button size="mini" @click="handleClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>

import api from '@/api/function'

export default {
  props: {
    title: { // 弹窗的标题
      type: String,
      default: ''
    },
    visible: { // 弹出窗口，true弹出
      type: Boolean,
      default: false
    },
    formData: { // 提交表单数据
      type: Object,
      default: {}
    },
    itemList: { // 正常状态的分类列表数据
      type: Array,
      default: []
    },
    remoteClose: Function // 用于关闭窗口
  },

  data() {
    return {
      rules: {
        name: [ // 标签名称
          { required: true, message: '请输入标签名称', trigger: 'blur' }
        ],
        itemId: [ // 分类
          { required: true, message: '请选择分类名称', trigger: 'change' }
        ],
        path: [ // 分类
          { required: true, message: '请输入安装路径', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    // 关闭弹窗
    handleClose() {
      // 表单清空
      this.$refs['formData'].resetFields()
      // 调用父组件中的方法关闭窗口
      this.remoteClose()
    },

    // 提交表单数据
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 校验通过，提交表单数据
          this.submitData()
        } else {
          // console.log('error submit!!');
          return false
        }
      })
    },

    // 调用接口提交数据
    async submitData() {
      let response = null

      if (this.formData.id) {
        // 编辑
        response = await api.update(this.formData)
      } else {
        // 新增
        response = await api.add(this.formData)
      }

      if (response.code === 20000) {
        this.$message({
          message: '保存成功',
          type: 'success'
        })
        // 关闭窗口
        this.handleClose()
      } else {
        this.$message({
          message: '保存失败',
          type: 'error'
        })
      }
    }
  }
}
</script>
