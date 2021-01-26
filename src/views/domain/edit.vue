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
      <el-form-item label="域名：" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="项目名称：" prop="itemId">
        <el-select v-model="formData.itemId" clearable filterable style="width: 100%" @change="inputToDisabled" @clear="defaultinputToDisabled">
          <el-option
            v-for="item in itemList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="CNAME：" prop="cname">
        <el-input v-model="formData.cname" />
      </el-form-item>
      <el-form-item label="负载均衡ELB：" prop="elb" style="white-space:nowrap;">
        <el-input v-model="formData.elb" />
      </el-form-item>
      <el-form-item label="设备列：" prop="assetIds">
        <el-select v-model="formData.assetIds" multiple clearable filterable style="width: 100%" :disabled="disabledInput">
          <el-option
            v-for="asset in editselassetList"
            :key="asset.id"
            :label="asset.hostname"
            :value="asset.id"
          />
        </el-select>
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
import api from '@/api/domain'
import itemApi from '@/api/item'

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
    itemList: { // 正常状态的分类列表数据
      type: Array,
      default: function() {
        return []
      }
    },

    selassetList: { // 正常状态的分类列表数据
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
        name: [ // prop值
          { required: true, message: '请输入域名', trigger: 'blur' }
        ],
        itemId: [ // prop值
          { required: true, message: '请选择项目名称', trigger: 'blur' }
        ],
        cname: [ // prop值
          { required: false, message: '请输入CNAME', trigger: 'blur' }
        ],
        elb: [ // prop值
          { required: false, message: '请输入负载均衡', trigger: 'blur' }
        ],
        assetIds: [
          { required: false, message: '请选择状态', trigger: 'change' }
        ],
        remark: [
          { required: false, message: '清输入备注', trigger: 'blur' }
        ]
      },

      editselassetList: this.selassetList, // selassetList是从父组件中导入，  子组件 prop父组件元素后，无法修改。

      disabledInput: true
    }
  },

  // 父组件传递子组件元素， 子组件需要修改数据
  // 父数据  selassetList   子数据  editselassetList
  // 通过watch 来只数据同步
  watch: {
    'selassetList': function(val) {
      this.editselassetList = val
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

    inputToDisabled() {
      // this.disabledInput = false
      this.disabledInput = false
      this.formData.assetIds = ''
      const codeId = this.formData.itemId
      if (typeof codeId === 'number') {
        itemApi.getSelAssetList(codeId).then(response => {
          if (response.code === 20000) {
            console.log(response.data)
            this.editselassetList = response.data
          }
        })
      } else {
        console.log('不是数字')
      }
    },

    defaultinputToDisabled() {
      this.disabledInput = true
      this.formData.assetIds = ''
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
