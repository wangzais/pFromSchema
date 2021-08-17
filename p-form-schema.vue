<script>
import createComponent from './form-schema-component';
export default {
    model: {
        prop: 'model',
        event: 'input'
    },

    props: {
        model: {
            type: Object,
            default: () => { return {}; }
        },
        schema: {
            type: Object,
            default: () => { return {}; }
        },
        isSearchForm: {
            type: Boolean,
            default: true
        },
        isExpand: {
            type: Boolean,
            default: false
        },
        expandValue: {
            type: Number,
            default: 2
        },
        size: {
            type: String,
            default: 'small'
        },
        disabledForm: {
            type: Boolean,
            default: false
        },
        inline: {
            type: Boolean,
            default: true
        },
        labelPrefix: {
            type: String,
            default: ''
        },
        labelWidth: {
            type: String,
            default: '88px'
        },
        componentWidth: {
            type: String,
            default: '240px'
        },
        css: {
            type: Object,
            default: () => { return {}; }
        },
        formName: {
            type: String,
            default: () => `form-creater-schema-${+new Date()}`
        },
        asyncValidatorPromise: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            filtersTags: ['submit-buttons', 'block'],
            clearValidateField: new Set(),
            updating: false,
            expandAll: false,
            formValues: {}
        };
    },

    watch: {
        formValues: {
            handler (values) {
                this.updating = true;
                // 解决clear的默认赋值: null 的情况，如果有默认值设置为defaultValue，没有则设置空字符串
                Object.keys(values).map(field => {
                    if ((this.schema[field])) {
                        if ((this.schema[field]).hasOwnProperty('defaultValue') && (values[field] === null || values[field] === '')) {
                            values[field] = (this.schema[field])['defaultValue'];
                        }
                    }
                });
                this.$emit('input', values);
            },
            deep: true
        },
        schema: {
            handler () {
                if (!this.updating) {
                    this.formValues = this.mergeValues();
                    this.$nextTick(() => {
                        this.updating = false;
                    });
                } else {
                    this.updating = false;
                }
            },
            deep: true
        }
    },

    render (h) {
        const vm = this;
        return h(
            'div',
            {
                style: {
                    display: 'flex',
                    margin: '10px 0',
                    padding: '20px 10px 0 10px',
                    ...(Object.keys(vm.css).length > 0 || !vm.inline
                        ? vm.css
                        : { border: '1px solid #EBEEF5' })
                },
                class: {
                    [vm.formName]: vm.formName
                }
            },
            [
                h(
                    'el-form',
                    {
                        ref: vm.formName,
                        style: {
                            width: '100%'
                        },
                        class: {
                            'form-creater-container': true
                        },
                        props: {
                            model: vm.formValues,
                            inline: vm.inline,
                            size: vm.size,
                            disabled: this.disabledForm,
                            labelWidth: vm.labelWidth
                        }
                    },
                    [
                        ...(vm.$slots.prepend || []),
                        ...(vm.renderFormItems(h) || []),
                        ...(vm.inline && vm.isSearchForm ? vm.renderSearchButtons(h) : []),
                        ...(vm.$slots.append || [])
                    ]
                )
            ]
        );
    },

    methods: {
        // 合并values，并设置默认值
        mergeValues () {
            const vm = this;
            const { model } = vm;
            const defaultValues = {};

            Object.keys(this.schema).map(key => {
                let item = this.schema[key];
                let { defaultValue = null, tag, attrs = {} } = item;
                if (!this.filtersTags.includes(tag)) {
                    if (
                        tag === 'el-checkbox' ||
                        (tag === 'el-select' && attrs.multiple)
                    ) {
                        defaultValue = defaultValue != null ? defaultValue : [];
                    }
                    defaultValues[key] = defaultValue || '';
                }
            });

            return {
                ...defaultValues,
                ...model
            };
        },
        // 根据tag去创建组件
        getTagForCreateComponent (tag, h, value, vm, item) {
            let component = [];
            // 根据tag类型，判断创建组件的方式：特殊组件 和 普通组件
            tag = createComponent[tag] ? tag : 'component';
            // 创建组件
            component = createComponent[tag](h, value, vm, item);
            //
            return component;
        },
        // 创建查询按钮
        renderSearchButtons (h) {
            let vm = this;
            return [
                h(
                    'el-form-item',
                    {
                        class: {
                            'el-form-item_search_buttons': true
                        },
                        style: {
                            marginLeft: vm.labelWidth
                        },
                        props: {
                            label: ''
                        }
                    },
                    [
                        h(
                            'el-button',
                            {
                                props: {
                                    size: vm.size,
                                    type: 'warning'
                                },
                                on: {
                                    click: () => {
                                        // 设置默认值
                                        Object.keys(vm.formValues).map(field => {
                                            let item = this.schema[field];
                                            if (item) {
                                                let { defaultValue = null } = item;
                                                if (defaultValue) { // 判断组件，是否有设置默认值：defaultValue
                                                    vm.formValues[field] = defaultValue;
                                                } else { // 设置值类型，默认值
                                                    vm.formValues[field] = vm.resetDefaultByValue(vm.formValues[field]);
                                                }
                                            }
                                        });
                                        vm.$emit('reset');
                                    }
                                }
                            },
                            '重置'
                        ),
                        h(
                            'el-button',
                            {
                                props: {
                                    size: vm.size,
                                    type: 'primary'
                                },
                                on: {
                                    click: () => {
                                        vm.$emit('submit', vm.formValues);
                                    }
                                }
                            },
                            '查询'
                        ),
                        vm.isExpand ? h(
                            'el-button',
                            {
                                style: {
                                    display: !vm.expandAll ? '' : 'none'
                                },
                                props: {
                                    size: vm.size
                                },
                                on: {
                                    click () {
                                        vm.expandAll = !vm.expandAll;
                                    }
                                }
                            },
                            [
                                '更多筛选',
                                h('i', {
                                    class: {
                                        'el-icon-caret-bottom': true
                                    }
                                })
                            ]
                        ) : null,
                        vm.isExpand ? h(
                            'el-button',
                            {
                                style: {
                                    display: vm.expandAll ? '' : 'none'
                                },
                                props: {
                                    size: vm.size
                                },
                                on: {
                                    click () {
                                        vm.expandAll = !vm.expandAll;
                                    }
                                }
                            },
                            [
                                '收起',
                                h('i', {
                                    class: {
                                        'el-icon-caret-top': true
                                    }
                                })
                            ]
                        ) : null
                    ]
                )
            ];
        },
        resetDefaultByValue (val) {
            if (Array.isArray(val)) {
                return [];
            } else if (typeof val === 'object' && val) {
                return '';
            } else {
                return '';
            }
        },
        renderComponent (h, item, key, isRenderFormItem = false) {
            if (item.tag === 'slot') {
                // 渲染占位slot
                return this.$slots[item.slot];
            } else {
                return this.renderFormItem(h, item, key, isRenderFormItem);
            }
        },
        compilerExpressionData (data) {
            try {
                // eslint-disable-next-line no-eval
                return eval(data.replace(/(\$model)/g, 'this.model'));
            } catch (ex) {
                throw new Error('表达式有问题，请排查：' + data);
            }
        },
        renderFormItem (h, item, key, isRenderFormItem = true) {
            let {
                label = '',
                rules = null,
                name = key,
                tag,
                on = {},
                vif = {},
                itemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' },
                expand = true,
                inline = true,
                line = false,
                loading = false,
                props = {},
                attrs = {},
                items = [],
                keys = { label: 'label', value: 'value' },
            } = item;
            // el-checkbox全选属性
            if (tag === 'el-checkbox') item.checkAll = [];
            // 默认加上loading样式/颜色/文字
            item.attrs = Object.assign(item.attrs || {}, {
                'element-loading-text': item.loadingText || '',
                'element-loading-background': item.loadingBackground || ''
            });
            // 支持diabled的表达式
            if (typeof props.disabled === 'string') props.disabledExpression = props.disabled;
            if (typeof attrs.disabled === 'string') attrs.disabledExpression = attrs.disabled;
            // props|attrs,是否包含禁用的表达式
            if (typeof props.disabledExpression === 'string') {
                props.disabled = this.compilerExpressionData(props.disabledExpression);
            } else if (typeof attrs.disabledExpression === 'string') {
                attrs.disabled = this.compilerExpressionData(attrs.disabledExpression);
            }
            //
            const vm = this;
            //
            const { formValues, size } = vm;
            // 获取value
            const value = formValues[name];
            // 合并事件
            Object.assign(on, {
                // 绑定组件的 v-model 事件
                input: (value) => {
                    formValues[name] = value || ((value !== 0) ? (item.defaultValue || '') : 0);
                    if (vm.$refs[vm.formName]) vm.$refs[vm.formName].validateField(name);
                    // ['el-select','el-radio'] 扩展changeItem方法 
                    // on : { changeItem(val,item) { console.log(val,item) } }
                    if(['el-select','el-radio'].includes(tag) && on.changeItem) {
                        const model = items.find(item=> item[keys ? keys['value'] : 'value'] == value);
                        on.changeItem.call(vm, value, model);
                    }
                }
            });
            item.on = on;
            // message 默认
            rules =
                !rules || Array.isArray(rules)
                    ? rules
                    : Object.assign({ message: '必填' }, rules);

            // 获取组件
            let renderComponent = this.getTagForCreateComponent(tag, h, value, vm, item);

            // if 逻辑
            let ifConditionBool = true;

            if (typeof vif === 'boolean' || vif === undefined) { // bool值vif
                ifConditionBool = vif;
            } else if (Array.isArray(vif)) { // 非空值vif: ['city','area']
                vif.map(key => {
                    if (!this.formValues[key] && ifConditionBool) {
                        ifConditionBool = false;
                    }
                });
            } else if (typeof vif === 'object') { // 简单值vif: {city:1}
                Object.keys(vif).map(key => {
                    if (this.formValues[key] !== vif[key] && ifConditionBool) {
                        ifConditionBool = false;
                    }
                });
            } else if (typeof vif === 'string') { // 复杂vif: "$model.city===1 || $model.select===2"
                ifConditionBool = this.compilerExpressionData(vif);
            }

            // 条件隐藏的字段，需要移除验证
            if (!ifConditionBool) {
                // 标记移除验证
                vm.clearValidateField.add(name);
            } else {
                vm.clearValidateField.delete(name);
            }

            if (!isRenderFormItem) return renderComponent;

            return h(
                'el-form-item',
                {
                    ref: name,
                    class: {
                        // 给 el-form-item 加上自定义的 inline 样式
                        'el-form-item-special': (vm.inline !== inline) && ((label && !['submit-buttons'].includes(tag)) || (!label && tag === 'block'))
                    },
                    style: {
                        display:
                            (ifConditionBool && (expand || this.expandAll))
                                ? ((tag !== 'submit-buttons' || label) && (vm.inline !== inline)) || ((typeof tag === 'object' || tag === 'submit-buttons') && !inline)
                                    ? 'flex'
                                    : ''
                                : 'none',
                        // block 组件定制样式
                        borderBottom: (tag === 'block' && line) ? '1px solid #ececec' : '',
                        paddingBottom: (tag === 'block' && line && value) ? '10px' : '',
                        width: tag === 'block' ? '100%' : '',
                        ...((!vm.isSearchForm && tag === 'submit-buttons') ? (vm.inline ? itemStyle : { display: 'flex' }) : {})
                    },
                    attrs: {
                        key: name,
                        componentWidth: this.componentWidth
                    },
                    props: {
                        size,
                        prop: name,
                        label:
                            (label.length === 0 || /(\s)$/.test(label))
                                ? label : vm.labelPrefix && !/(:|：)$/.test(label) && label
                                    ? label + vm.labelPrefix : label,
                        rules: rules,
                        labelWidth: item.labelWidth || vm.labelWidth
                    }
                },
                renderComponent
            );
        },
        // 渲染 el-form-item 里的组件
        renderFormItems (h) {
            return Object.keys(this.schema).map((key, index) => {
                // key当作name来处理
                this.schema[key].name = key;
                // 是否展开/收起
                if (this.isExpand) this.schema[key].expand = index < this.expandValue;
                //
                if (this.schema[key].tag === 'slot') {
                    // 渲染占位slot
                    return this.$slots[this.schema[key].slot];
                } else {
                    // 渲染formItem
                    return this.renderFormItem(h, this.schema[key], key);
                }
            });
        },
        // 老方法：重置表单项的验证
        resetFields (fields, cb = 'resetField') {
            this.formValidator(fields, cb);
        },
        // 新方法：表单验证
        formValidator (fields, cb = 'resetField') {
            if (Array.isArray(fields)) {
                fields.map(field => {
                    this.$nextTick(() => {
                        if (this.$refs[field]) {
                            if (this.$refs[field][cb]) { this.$refs[field][cb](); }
                        } else {
                            console.log(this.$refs);
                        }
                    });
                });
            } else if (this.$refs[fields]) {
                this.$nextTick(() => {
                    if (this.$refs[fields][cb]) { this.$refs[fields][cb](); }
                });
            }
        },
        // 提交表单
        submitForm () {
            let vm = this;
            let fieldList = Array.from(vm.clearValidateField);
            let validBool = true;
            // 移除验证
            fieldList.forEach(field => {
                if (vm.$refs[field].hasOwnProperty('resetField')) {
                    vm.$refs[field].resetField();
                }
            });
            // 是否返回 async-validator promise 对象
            if (!this.asyncValidatorPromise) {
                // 验证字段
                vm.$refs[vm.formName].validate((valid, model) => {
                    Object.keys(model).forEach(field => {
                        if (!fieldList.includes(field)) {
                            validBool = false;
                        } else if (fieldList.length > 0 && fieldList.includes(field)) {
                            vm.$refs[field].resetField();
                        }
                    });
                });
                return validBool;
            } else {
                return vm.$refs[vm.formName].validate;
            }
        },
        // 触发表单验证
        validateForm (cb) {
            this.$refs[this.formName].validate(cb);
        },
        // 重置表单
        resetForm () {
            let vm = this;
            // 清楚隐藏字段的数据
            vm.clearValidateField.clear();
            // 重置表单
            vm.$refs[vm.formName].resetFields();
        }
    },

    updated () {
        // 设置inline为true时，给(el-radio 和 el-checkbox)加上特殊的样式
        this.$nextTick(() => {
            // 设置el-form-item下样式
            Array.from(
                document.querySelectorAll(
                    `.${this.formName} .el-form-item-special .el-form-item__content`
                )
            ).forEach(element => {
                element.style = 'margin-left:0px;';
            });
            // 设置el-form-item的label，使其统一
            Array.from(
                document.querySelectorAll(
                    `.${this.formName} .el-form-item-special .el-form-item__label`
                )
            ).forEach(element => {
                element.style = `min-width: ${this.labelWidth}`;
            });
            // 设置el-form-item_search_buttons的按钮样式，使其对象
            if (document.querySelector(`.${this.formName} .el-form-item_search_buttons .el-form-item__content`)) {
                document.querySelector(
                    `.${this.formName}  .el-form-item_search_buttons .el-form-item__content`
                ).style = 'line-height:32px';
            }
        });
    }
};
</script>
