<template>
  <el-dialog
    :title="title"
    :visible.sync="visible"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formData"
      :rules="rules"
      :model="formData"
      label-width="100px"
      label-position="right"
      style="width: 500px"
      status-icon
    >
      <el-form-item label="设备名称：" prop="hostname">
        <el-input v-model="formData.hostname" />
      </el-form-item>
      <el-form-item label="内网IP：" prop="lanip">
        <el-input v-model="formData.lanip" />
      </el-form-item>
      <el-form-item label="外网IP：" prop="wanip">
        <el-input v-model="formData.wanip" />
      </el-form-item>
      <el-form-item label="功能列：">
        <el-cascader
          v-model="formData.functionIds"
          :options="functionOptions"
          style="display: block"
          :props="{multiple: true, emitPath: false, children: 'functionList', value: 'id', label: 'name'}"
          clearable
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="0">已删除</el-radio>
          <el-radio :label="1">待下架</el-radio>
          <el-radio :label="2">正常</el-radio>
          <el-radio :label="3">空闲</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="项目名称：">
        <el-select v-model="formData.itemId" clearable filterable style="width: 400px">
          <el-option
            v-for="item in itemList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注：" prop="summary">
        <el-input v-model="formData.summary" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="mini" @click="submitForm('formData')">确定</el-button>
        <el-button size="mini" @click="handleClose">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import api from '@/api/asset'

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
      default: function() {
        return {}
      }
    },
    itemList: { //
      type: Array,
      default: function() {
        return []
      }
    },

    functionOptions: { // 渲染分类标签级联下拉框
      type: Array,
      default: function() {
        return []
      }
    },
    remoteClose: Function // 用于关闭窗口
  },

  data() {
    return {
      rules: {
        hostname: [ // prop值
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        lanip: [ // prop值
          { required: true, message: '请输入设备内网IP', trigger: 'blur' }
        ],
        wanip: [ // prop值
          { required: false, message: '请输入设备外网IP', trigger: 'blur' }
        ],
        summary: [ // prop值
          { required: false, message: '请输入简介', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },

  methods: {
    // 关闭窗口
    handleClose() {
      // 将表单清空
      this.$refs['formData'].resetFields()
      // 注意不可以通过  this.visible = false来关闭，因为它是父组件的属性
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
