/**
 * Advanced Table Component
 * 
 * Enhanced table with sorting, filtering, search, pagination,
 * row selection, and CNC-specific data display features.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Table as AntTable, Input, Button, Space, Dropdown, Checkbox, Tag, Tooltip } from 'antd';
import { ColumnsType, TableProps as AntTableProps } from 'antd/es/table';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../shared/utils';
import { 
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  MoreOutlined,
  ExportOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';

// ============================================================================
// TYPES
// ============================================================================

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'number' | 'boolean';
  filterOptions?: Array<{ text: string; value: any }>;
  sorter?: boolean | ((a: T, b: T) => number);
}

export interface AdvancedTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  searchable?: boolean;
  exportable?: boolean;
  refreshable?: boolean;
  selectable?: boolean;
  pagination?: boolean | {
    pageSize?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  rowKey?: string | ((record: T) => string);
  onRowSelect?: (selectedRows: T[], selectedRowKeys: React.Key[]) => void;
  onRowClick?: (record: T) => void;
  onRefresh?: () => void;
  onExport?: (data: T[]) => void;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  scroll?: { x?: number; y?: number };
  expandable?: {
    expandedRowRender: (record: T) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
}

// ============================================================================
// ADVANCED TABLE COMPONENT
// ============================================================================

export const AdvancedTable = <T extends Record<string, any>>({ 
  data,
  columns,
  loading = false,
  searchable = true,
  exportable = false,
  refreshable = false,
  selectable = false,
  pagination = true,
  rowKey = 'id',
  onRowSelect,
  onRowClick,
  onRefresh,
  onExport,
  className,
  size = 'middle',
  scroll,
  expandable,
}: AdvancedTableProps<T>) => {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter(col => !col.hidden).map(col => col.key)
  );
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  
  // Filter data based on search and column filters
  const processedData = useMemo(() => {
    let result = [...data];
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(record => {
        return columns.some(column => {
          if (!column.searchable) return false;
          const value = column.dataIndex ? record[column.dataIndex] : '';
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }
    
    // Apply column filters
    Object.entries(columnFilters).forEach(([columnKey, filterValue]) => {
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        const column = columns.find(col => col.key === columnKey);
        if (column && column.dataIndex) {
          result = result.filter(record => {
            const value = record[column.dataIndex!];
            
            switch (column.filterType) {
              case 'text':
                return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
              case 'select':
                return value === filterValue;
              case 'number':
                return Number(value) === Number(filterValue);
              case 'boolean':
                return Boolean(value) === Boolean(filterValue);
              default:
                return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            }
          });
        }
      }
    });
    
    return result;
  }, [data, searchText, columnFilters, columns]);
  
  // Convert columns to Ant Design format
  const antColumns: ColumnsType<T> = useMemo(() => {
    return columns
      .filter(column => visibleColumns.includes(column.key))
      .map(column => {
        const antColumn: any = {
          key: column.key,
          title: column.title,
          dataIndex: column.dataIndex,
          render: column.render,
          width: column.width,
          fixed: column.fixed,
          align: column.align,
        };
        
        // Add sorting
        if (column.sortable) {
          antColumn.sorter = column.sorter || ((a: T, b: T) => {
            const aVal = column.dataIndex ? a[column.dataIndex] : '';
            const bVal = column.dataIndex ? b[column.dataIndex] : '';
            
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return aVal - bVal;
            }
            
            return String(aVal).localeCompare(String(bVal));
          });
        }
        
        // Add filtering
        if (column.filterable) {
          if (column.filterOptions) {
            antColumn.filters = column.filterOptions.map(option => ({
              text: option.text,
              value: option.value,
            }));
            antColumn.onFilter = (value: any, record: T) => {
              if (!column.dataIndex) return false;
              return record[column.dataIndex] === value;
            };
          } else {
            antColumn.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
              <div className="p-2 space-y-2">
                <Input
                  placeholder={`Search ${column.title}`}
                  value={selectedKeys[0]}
                  onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                  onPressEnter={() => confirm()}
                  className="w-48"
                />
                <div className="flex space-x-2">
                  <Button
                    type="primary"
                    onClick={() => confirm()}
                    icon={<SearchOutlined />}
                    size="small"
                    className="flex-1"
                  >
                    Filter
                  </Button>
                  <Button
                    onClick={() => {
                      clearFilters();
                      confirm();
                    }}
                    size="small"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            );
            antColumn.filterIcon = (filtered: boolean) => (
              <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
            );
            antColumn.onFilter = (value: any, record: T) => {
              if (!column.dataIndex) return false;
              const recordValue = record[column.dataIndex];
              return String(recordValue).toLowerCase().includes(String(value).toLowerCase());
            };
          }
        }
        
        return antColumn;
      });
  }, [columns, visibleColumns]);
  
  // Handle row selection
  const rowSelection = useMemo(() => {
    if (!selectable) return undefined;
    
    return {
      selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[], selectedRows: T[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
        onRowSelect?.(selectedRows, newSelectedRowKeys);
      },
      getCheckboxProps: (record: T) => ({
        name: record.name || record.id || 'record',
      }),
    };
  }, [selectable, selectedRowKeys, onRowSelect]);
  
  // Handle export
  const handleExport = useCallback(() => {
    onExport?.(processedData);
  }, [onExport, processedData]);
  
  // Column visibility menu
  const columnVisibilityMenu = {
    items: columns.map(column => ({
      key: column.key,
      label: (
        <Checkbox
          checked={visibleColumns.includes(column.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setVisibleColumns([...visibleColumns, column.key]);
            } else {
              setVisibleColumns(visibleColumns.filter(key => key !== column.key));
            }
          }}
        >
          {column.title}
        </Checkbox>
      ),
    })),
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        {/* Left side - Search */}
        <div className="flex items-center space-x-2">
          {searchable && (
            <Input
              placeholder="Search table..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
          )}
          
          {selectable && selectedRowKeys.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm text-secondary-400"
            >
              {selectedRowKeys.length} selected
            </motion.div>
          )}
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {refreshable && (
            <Tooltip title="Refresh">
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              />
            </Tooltip>
          )}
          
          {exportable && (
            <Tooltip title="Export">
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
                disabled={processedData.length === 0}
              />
            </Tooltip>
          )}
          
          <Dropdown menu={columnVisibilityMenu} trigger={['click']}>
            <Tooltip title="Column Settings">
              <Button icon={<SettingOutlined />} />
            </Tooltip>
          </Dropdown>
        </div>
      </div>
      
      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AntTable<T>
          columns={antColumns}
          dataSource={processedData}
          loading={loading}
          rowKey={rowKey}
          rowSelection={rowSelection}
          pagination={pagination === false ? false : {
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} items`,
            ...(typeof pagination === 'object' ? pagination : {}),
          }}
          scroll={scroll}
          size={size}
          expandable={expandable}
          onRow={(record) => ({
            onClick: () => onRowClick?.(record),
            className: onRowClick ? 'cursor-pointer hover:bg-secondary-50' : '',
          })}
          className="shadow-sm border border-border rounded-lg overflow-hidden"
        />
      </motion.div>
    </div>
  );
};

// ============================================================================
// CNC-SPECIFIC TABLE COMPONENTS
// ============================================================================

/**
 * Job History Table
 */
export interface JobRecord {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  material: string;
  toolsUsed: string[];
  progress: number;
  errors?: string[];
}

export const JobHistoryTable: React.FC<{
  jobs: JobRecord[];
  loading?: boolean;
  onJobClick?: (job: JobRecord) => void;
  onRefresh?: () => void;
}> = ({ jobs, loading, onJobClick, onRefresh }) => {
  const columns: TableColumn<JobRecord>[] = [
    {
      key: 'name',
      title: 'Job Name',
      dataIndex: 'name',
      sortable: true,
      searchable: true,
      width: 200,
      render: (name: string, record: JobRecord) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-secondary-400">{record.id}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      filterable: true,
      width: 120,
      filterType: 'select',
      filterOptions: [
        { text: 'Pending', value: 'pending' },
        { text: 'Running', value: 'running' },
        { text: 'Completed', value: 'completed' },
        { text: 'Failed', value: 'failed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      render: (status: string) => {
        const colors = {
          pending: 'orange',
          running: 'blue',
          completed: 'green',
          failed: 'red',
          cancelled: 'default',
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      key: 'progress',
      title: 'Progress',
      dataIndex: 'progress',
      width: 120,
      render: (progress: number) => (
        <div className="w-full">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-secondary-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'startTime',
      title: 'Start Time',
      dataIndex: 'startTime',
      sortable: true,
      width: 150,
      render: (date: Date) => new Date(date).toLocaleString(),
    },
    {
      key: 'duration',
      title: 'Duration',
      dataIndex: 'duration',
      sortable: true,
      width: 100,
      render: (duration: number) => {
        if (!duration) return '-';
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },
    },
    {
      key: 'material',
      title: 'Material',
      dataIndex: 'material',
      filterable: true,
      searchable: true,
      width: 120,
    },
    {
      key: 'toolsUsed',
      title: 'Tools',
      dataIndex: 'toolsUsed',
      width: 150,
      render: (tools: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tools.slice(0, 2).map(tool => (
            <Tag key={tool} size="small">{tool}</Tag>
          ))}
          {tools.length > 2 && (
            <Tag size="small">+{tools.length - 2}</Tag>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <AdvancedTable<JobRecord>
      data={jobs}
      columns={columns}
      loading={loading}
      searchable
      refreshable
      selectable
      onRowClick={onJobClick}
      onRefresh={onRefresh}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
      }}
      expandable={{
        expandedRowRender: (record) => (
          <div className="space-y-2 p-4 bg-secondary-50 rounded">
            {record.errors && record.errors.length > 0 && (
              <div>
                <div className="font-medium text-red-600 mb-2">Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {record.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Job ID:</span> {record.id}
              </div>
              <div>
                <span className="font-medium">All Tools:</span> {record.toolsUsed.join(', ')}
              </div>
            </div>
          </div>
        ),
        rowExpandable: (record) => !!(record.errors?.length || record.toolsUsed.length > 2),
      }}
    />
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AdvancedTable;
export type { TableColumn, AdvancedTableProps, JobRecord };
