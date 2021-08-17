export default {
    //  自定义标题组件(特殊)
    'block': function (h, value, vm, { width, attrs = {}, defaultValue, props = {}, style = {}, render = { before: null, append: null, after: null } }) {
        if (!style.width) style.width = width || vm.componentWidth;
        value = value || defaultValue;
        return [
            (typeof render.before === 'function') ? render.before.call(vm, h) : [],
            value ? h('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: style.width,
                    ...style
                },
                attrs: {
                    ...attrs
                },
                props: {
                    value,
                    ...props
                }
            }, [
                h('span', {
                    style: {
                        borderLeft: `4px solid ${props.color || '#ffd04b'}`,
                        borderRadius: '5px',
                        width: '0px',
                        height: '20px',
                        lineHeight: '20px'
                    }
                }),
                h('span', {
                    style: {
                        paddingLeft: '5px',
                        color: '#777777',
                        fontSize: '20px'
                    }
                }, value)
            ]) : '',
            (typeof render.after === 'function') ? render.after.call(vm, h) : []
        ];
    },
    //  自定义文本组件(特殊)
    'text': function (h, value, vm, { loading = false, on = {}, width = '', inline = true, attrs = {}, props = {}, style = {}, render = { before: null, append: null, after: null } }) {
        if (!style.width) style.width = width || vm.componentWidth;
        return [
            (typeof render.before === 'function') ? render.before.call(vm, h) : [],
            h('span', {
                style: {
                    display: inline ? 'inline-block' : 'inline',
                    fontSize: '15px',
                    color: '#777777',
                    lineHeight: '32px',
                    height: '32px',
                    ...style
                },
                attrs: {
                    ...attrs
                },
                props: {
                    value,
                    ...props
                },
                directives: [
                    {
                        name: 'loading',
                        value: loading
                    }
                ],
                on: {
                    ...on
                }
            }, value),
            (typeof render.after === 'function') ? render.after.call(vm, h) : []
        ];
    },
    //  复选列表组件(特殊)
    'el-checkbox': function (h, value, vm, { loading = false, checkAll, inline, width, items = [], all = '', name, on = {}, attrs = {}, props = {}, style = {}, checkAllDisabled = false, keys = null, render = { before: null, after: null }, ref = null }) {
        if (!style.width) style.width = inline ? (width || vm.componentWidth) : '';
        if (value.length > 0) {
            if (value.includes(all) || (all && all !== undefined && value.length === items.length - 1)) {
                let ids = items.map(m => keys ? m[keys['value']] : m['value']);
                checkAll = ids;
                value = JSON.parse(JSON.stringify(ids));
            }
        }
        return [
            (typeof render.before === 'function') ? render.before.call(vm, h) : [],
            h(
                'el-checkbox-group',
                {
                    style: {
                        ...style
                    },
                    attrs: {
                        ...attrs
                    },
                    props: {
                        value,
                        ...props
                    },
                    directives: [
                        {
                            name: 'loading',
                            value: loading
                        }
                    ],
                    on: {
                        ...on,
                        input: (val) => {
                            // 包含全部选中的逻辑
                            if ((all + '').length > 0) {
                                let option = [];
                                items.filter(m => {
                                    let allValue = keys ? m[keys['value']] : m['value'];
                                    if (allValue === all) {
                                        option.push(m);
                                    }
                                });
                                if (option.length > 0) {
                                    if ((val.includes(all) && !checkAll.includes(all)) || (!val.includes(all) && !checkAll.includes(all) && items.length - 1 === val.length)) {
                                        val = [];
                                        items.forEach((item, index) => {
                                            if (checkAllDisabled) {
                                                item.disabled = index !== 0;
                                            }
                                            val.push(keys ? item[keys['value']] : item['value']);
                                        });
                                    } else if (!val.includes(all) && checkAll.includes(all)) {
                                        val = [];
                                        items.forEach(item => {
                                            item.disabled = false;
                                        });
                                    } else if (val.includes(all)) {
                                        val.splice(val.indexOf(all), 1);
                                    }
                                    checkAll = val;
                                }
                            }
                            vm.formValues[name] = val;
                        }
                    },
                    ref: ref || ref
                },
                (items || []).map((option, index) => {
                    return h(
                        'el-checkbox',
                        {
                            props: {
                                key: option.value,
                                disabled: option.disabled,
                                label: keys ? option[keys['value']] : option['value']
                            }
                        },
                        [keys ? option[keys['label']] : option['label']]
                    );
                })
            ),
            (typeof render.after === 'function') ? render.after.call(vm, h) : []
        ];
    },
    //  单选列表组件(特殊)
    'el-radio': function (h, value, vm, { loading = false, inline, items = [], width, on = {}, attrs = {}, props = {}, style = {}, render = { before: null, after: null }, keys = null }) {
        if (!style.width) style.width = inline ? (width || vm.componentWidth) : '';
        return [
            (typeof render.before === 'function') ? render.before.call(vm, h) : [],
            h('el-radio-group',
                {
                    style: {
                        ...style
                    },
                    attrs: {
                        ...attrs
                    },
                    props: {
                        value,
                        ...props
                    },
                    directives: [
                        {
                            name: 'loading',
                            value: loading
                        }
                    ],
                    on: {
                        ...on
                    }
                },
                (items || []).map(option => {
                    return h(
                        'el-radio',
                        {
                            style: {
                                lineHeight: '32px'
                            },
                            props: {
                                key: option.value,
                                disabled: option.disabled,
                                label: keys ? option[keys['value']] : option['value']
                            }
                        },
                        [keys ? option[keys['label']] : option['label']]
                    );
                })
            ),
            (typeof render.after === 'function') ? render.after.call(vm, h) : []
        ];
    },
    //  下拉列表组件(特殊)
    'el-select': function (h, value, vm, { slot, loading = false, label = '', items = [], on = {}, width = '', attrs = {}, props = {}, style = {}, keys = null, render = { before: null, append: null, after: null }, ref = null }) {
        if (!style.width) style.width = width || vm.componentWidth;
        return [
            (typeof render.before === 'function') ? render.before.call(vm, h) : [],
            h(
                'el-select',
                {
                    style: {
                        ...style
                    },
                    attrs: {
                        placeholder: attrs.placeholder || ('请选择' + label),
                        ...attrs
                    },
                    props: {
                        value,
                        placeholder: props.placeholder || ('请选择' + label),
                        ...props
                    },
                    on: {
                        ...on
                    },
                    directives: [
                        {
                            name: 'loading',
                            value: loading
                        }
                    ],
                    slot: slot,
                    ref: ref || name
                },
                (items || []).map(option => {
                    return h('el-option', {
                        style: {
                            minWidth: style.width
                        },
                        attrs: {
                            ...option
                        },
                        props: {
                            key: option.value,
                            disabled: option.disabled,
                            label: keys ? option[keys['label']] : option['label'],
                            value: keys ? option[keys['value']] : option['value']
                        }
                    }, (typeof render.append === 'function') ? render.append.call(vm, h, option) : []);
                }).concat(h('p', {
                    style: {
                        width: style.width,
                        color: '#777777',
                        fontSize: '14px',
                        textAlign: 'center',
                        lineHeight: props.filterable ? '' : ''
                    },
                    slot: 'empty'
                }, props.loading ? '加载中...' : '暂无数据'))
            ),
            (typeof render.after === 'function') ? render.after.call(vm, h) : []
        ];
    },
    //  标签组件(特殊)
    'el-tag': function (h, value, vm, { items = [], on = {}, props = {}, style = {}, keys = null, render = { before: null, append: null, after: null }, ref = null }) {
        return [
            (typeof render.before === 'function') ? render.before.call(vm, h) : [],
            (items || []).map(option => {
                return h('el-tag', {
                    style: {
                        ...style
                    },
                    props: {
                        key: keys ? option[keys['value']] : option['value'],
                        ...props
                    },
                    on: {
                        close: on.close.bind(vm, items, option)
                    }
                }, keys ? option[keys['label']] : option['label']);
            }),
            (typeof render.after === 'function') ? render.after.call(vm, h) : []
        ];
    },
    // 自定义组件 或 常规的饿了么组件 (特殊)
    'component': function (h, value, vm, { slot, loading = false, label = '', tag, on = {}, name, width = '', attrs = {}, props = {}, style = {}, render = { before: null, append: null, after: null }, ref = null }) {
        // 设置组件width
        if (!style.width && (tag === 'el-input' || tag === 'el-date-picker' || tag === 'el-autocomplete' || tag === 'el-cascader' || tag === 'el-input-number' || tag === 'el-time-picker')) style.width = width || vm.componentWidth;
        // 根据tag获取placeholder的前缀
        let placeholderDictByTag = { 'el-input': '请输入', 'el-autocomplete': '请输入', 'el-date-picker': '请选择', 'el-time-picker': '请选择', 'el-cascader': '请选择' };
        // 取消在范围选择器里取消两个日期面板之间的联动
        if (tag === 'el-date-picker' && props.type === 'daterange') Object.assign(props, { unlinkPanels: true });
        // ［注意⚠️］默认给自定义组件开放了 v-model 的双向版定，每个组件内部只需要单独触发 this.$emit('input', 值) 就可以了
        return [
            (typeof render.before === 'function') ? render.before.call(vm, h) : [],
            h(tag, {
                style: {
                    ...style
                },
                attrs: {
                    ...(!attrs.placeholder && typeof tag !== 'object' ? { placeholder: props.placeholder || ((placeholderDictByTag[tag] || '') + label) } : {}),
                    ...attrs
                },
                props: {
                    value,
                    ...(!props.placeholder && typeof tag !== 'object' ? { placeholder: props.placeholder || ((placeholderDictByTag[tag] || '') + label) } : {}),
                    ...props
                },
                on: {
                    // 用来监听自定义组件的值变化,是否开启
                    validator (val) {
                        vm.$refs[vm.formName].validateField([name]);
                    },
                    ...on
                },
                directives: [
                    {
                        name: 'loading',
                        value: loading
                    }
                ],
                slot: slot,
                ref: ref || name
            },
                (typeof render.append === 'function') ? render.append.call(vm, h) : []
            ),
            (typeof render.after === 'function') ? render.after.call(vm, h) : []
        ];
    },
    // 表单按钮
    'submit-buttons': function (h, value, vm, item) {
        return [
            (typeof item.submit === 'function') ? h('el-button', {
                attrs: {
                    type: 'primary',
                    size: vm.size
                },
                props: {
                    loading: item.loading
                },
                on: {
                    click: () => {
                        if (typeof item.submit === 'function') {
                            item.submit.call(vm.$parent, vm.submitForm());
                        }
                    }
                }
            }, item.submitText || '提交') : [],
            (typeof item.reset === 'function') ? h('el-button', {
                attrs: {
                    type: 'primary',
                    size: vm.size
                },
                on: {
                    click: () => {
                        vm.resetForm();
                        if (typeof item.reset === 'function') item.reset.call(vm.$parent);
                    }
                }
            }, item.resetText || '重置') : [],
            (typeof item.back === 'function') ? h('el-button', {
                attrs: {
                    type: '',
                    size: vm.size
                },
                on: {
                    click: () => {
                        if (typeof item.back === 'function') item.back.call(vm.$parent);
                    }
                }
            }, item.backText || '返回') : []
        ];
    }
};
