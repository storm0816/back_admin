<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="500px"
    :before-close="handleClose"
  >

    <el-form
      ref="formData"
      :rules="rules"
      :model="formData"
      label-width="100px"
      label-position="right"
      style="width: 400px"
      status-icon
    >
      <el-form-item label="类型：" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio :label="1">目录</el-radio>
          <el-radio :label="2">菜单</el-radio>
          <el-radio v-if="formData.parentId !== 0" :label="3">按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="名称：" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="权限标识：" prop="code">
        <el-input v-model="formData.code" />
      </el-form-item>
      <el-form-item v-if="formData.type != 3" label="请求地址：" prop="url">
        <el-input v-model="formData.url" />
      </el-form-item>
      <el-form-item v-if="formData.type != 3" label="图标：" prop="icon">
        <el-input v-model="formData.icon" />
      </el-form-item>
      <el-form-item v-if="formData.type == 3" label="权限名称：" prop="permissionId">
        <el-select v-model="formData.permissionId" clearable filterable style="width: 300px">
          <el-option
            v-for="item in permissionList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="排序：" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" :max="10000" style="width: 300px" />
      </el-form-item>
      <el-form-item label="备注：" prop="remark">
        <el-input v-model="formData.remark" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="submitForm('formData')">确定</el-button>
        <el-button size="mini" @click="handleClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>

import api from '@/api/menu'

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
    permissionList: { // 后台权限列表
      type: Array,
      default: function() { return [] }
    },

    remoteClose: Function // 用于关闭窗口
  },

  data() {
    return {
      rules: {
        type: [ // prop值
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        name: [ // prop值
          { required: true, message: '请输入菜单名称', trigger: 'blur' }
        ],
        code: [ // prop值
          { required: true, message: '请输入权限标识', trigger: 'blur' }
        ]
      }
    }
  },

  methods: {
    // 关闭窗口
    handleClose() {
      this.$refs['formData'].resetFields()
      this.remoteClose()
    },

    // 提交表单数据
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 校验通过，提交表单数据
          // 判断类型是否为按钮，按钮则不提交：请求地址，图标，将两个属性设置为null
          if (this.formData.type === 3) {
            this.formData.url = ''
            this.formData.icon = ''
          }
          // 提交数据
          this.submitData()
        } else {
          // console.log('error submit!!');
          return false
        }
      })
    },

    async submitData() {
      let response = null

      if (this.formData.id) {
        // 修改
        response = await api.update(this.formData)
      } else {
        // 新增
        response = await api.add(this.formData)
      }

      if (response.code === 20000) {
        // 提交成功
        this.$message({ message: '保存成功', type: 'success' })
        // 关闭窗口
        this.handleClose()
      } else {
        this.$message({ message: '保存失败', type: 'error' })
      }
    }

  }

}
</script>
