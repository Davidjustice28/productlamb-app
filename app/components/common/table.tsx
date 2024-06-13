import React, { useEffect } from "react"
import { PLStatusBadge } from "./status-badge"
import { Colors } from "~/types/base.types"
import { PLTableProps } from "~/types/component.types"

export function PLTable<T extends {[key:string]: any, id: number}>({data, columns=[], actionsAvailable=true, checked, columnsVisible=true, component, tableModalName="rows", onCheck}: PLTableProps<T>) {
  const [checkedRowIds, setCheckedRowIds] = React.useState<Array<number>>([...checked])
  const [rowData, setRowData] = React.useState<Array<T>>(data)
  
  function handleSort(direction: "asc" | "desc" | "none", key: string) {
    if(direction === "none") {
      setRowData(data)
    } else {
      const sorted = rowData.sort((a,b) => sortUnknownField(a[key], b[key], direction))
      setRowData(sorted)
    }
  }

  useEffect(() => {
    setRowData(data)
  }, [data])

  return (
    <div className="relative overflow-x-auto sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border-spacing-y-4">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-800 dark:text-gray-400">
            <tr>
                <th scope="col" className={"p-4 " + (actionsAvailable && columnsVisible ? '' : 'hidden')}>
                    <div className="flex items-center">
                        <input 
                          id="checkbox-all-search" 
                          type="checkbox"
                          checked={checkedRowIds.length === rowData.length && rowData.length !== 0}
                          className="w-4 h-4 dark:accent-orange-600 accent-orange-300 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          onChange={(e) => {
                            if(e.target.checked) {
                              const updatedList = rowData.map(i => i.id)
                              if(onCheck) {
                                onCheck(updatedList)
                              }
                              setCheckedRowIds(updatedList)
                            } else {
                              if(onCheck) {
                                onCheck([])
                              }
                              setCheckedRowIds([])
                            }

                          }}
                        />
                        <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                    </div>
                </th>

                {
                  columnsVisible && columns.map(({key}, index) => {
                    const [sort, setSort] = React.useState<"asc" | "desc" | "none">("none")
                    const [sortIcon, setSortIcon] = React.useState<string>("ri-arrow-up-down-line")
                    function sortColumn() {
                      if(sort === "none"){
                        setSortIcon("ri-arrow-down-line text-orange-400 dark:text-orange-500")
                        handleSort("asc", key)
                        setSort("asc")
                      } else if(sort === "asc") {
                        setSortIcon("ri-arrow-up-line text-orange-400 dark:text-orange-500")
                        handleSort("desc", key)
                        setSort("desc")
                      } else {
                        setSortIcon("ri-arrow-up-down-line text-black dark:text-gray-400")
                        handleSort("none", key)
                        setSort("none")
                      }
                    }

                    React.useEffect(() => {
                      handleSort(sort, key)
                    }, [sort])
                    
                    return (
                      <th scope="col" className="px-6 py-3" key={index} onClick={sortColumn}>
                        {key}
                        {columns[index].sortable && <i className={"ml-2 " + sortIcon}></i>}
                      </th>
                    )
                  })
                }
            </tr>
        </thead>
        <tbody>
          {rowData.length === 0 && <p className="">No {tableModalName + " found"}</p>}
          {rowData.map((item: T, index) => {
            if (component) {
              const Component = component as React.ComponentType<{ data: T }>; // Add type assertion
              return (
                <tr key={index} >
                  <Component data={item}/> {/* Use the Component variable */}
                </tr>
              );
            }
            return (
              <tr key={index} className="bg-white border-b dark:bg-neutral-700 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-orange-400 dark:hover:text-white">
                  <td className={"w-4 p-4 " + (actionsAvailable ? '' : 'hidden')}>
                      <div className="flex items-center">
                          <input 
                            checked={checkedRowIds.includes(item.id)}
                            onChange={(e) => {
                              if(e.target.checked) {
                                const updatedList = [...checkedRowIds, item.id]
                                if(onCheck) {
                                  onCheck(updatedList)
                                }
                                setCheckedRowIds(updatedList)
                              } else {
                                const filteredList = checkedRowIds.filter(i => i !== item.id)
                                if(onCheck) {
                                  onCheck(filteredList)
                                }
                                setCheckedRowIds(filteredList)
                              }
                            }}
                            id="checkbox-table-search-1" type="checkbox" 
                            className="w-4 h-4 dark:accent-orange-600 accent-orange-300 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label htmlFor="checkbox-table-search-1" className="sr-only">checkbox</label>
                      </div>
                  </td>

                  {columns.map((column, index) => {
                    const key = typeof column === "string" ? column : column.key
                    const itemContent = item[key]
                    const roundingClass = index === (columns.length - 1) ? "rounded-r-lg" : ""
                    if(!index) {
                      return (
                        <th scope="row" className={"px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"}key={index}>
                          <TableDataCellContent type={column.type} data={itemContent} key={key}/>
                        </th>
                      )
                    } else {
                      return (
                        <td className={"px-6 py-4 "} key={index}>
                          <TableDataCellContent type={column.type} data={itemContent} key={key}/>
                        </td>
                      )
                    }
                  })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TableDataCellContent({type, data, key}: {type: "text"| "status"|"image", data: any, key: string}) {
  if(type === 'text') return <span>{data}</span>
  if(type === 'image') return data ? <img src={data} alt={key} className="w-10 h-10 rounded-full"/> : <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-600 flex flex-row items-center justify-center"><i className="ri-user-line dark:text-gray-400 text-black text-2xl"></i></div>
  let text = ''

  switch (typeof data) {
    case 'string':
      text = data
      break
    case 'object':
      if(data instanceof Date) {
        text = data.toDateString()
      } else {
        text = 'N/A'
      }
      break
    case 'number':
      text = data.toString()
      break
    case 'boolean':
      text = data ? 'Yes' : 'No'
      break
    default:
      text = 'N/A'
  }

  const color = getStatusColor(text)
  return <PLStatusBadge text={text} color={color}/>
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'not started':
    case 'to do':
    case 'not-started':
      return Colors.GRAY
    case 'in progress':
      return Colors.BLUE
    case 'completed':
    case 'done':
    case 'yes':
      return Colors.GREEN
    case 'under construction':
      return Colors.YELLOW
    case 'canceled':
    case 'no':
      return Colors.RED
    default:
      return Colors.GRAY
  }
}

function sortUnknownField<T=any>(a: T, b: T, direction: "asc" | "desc") : number {
  if(typeof a === 'string') {
    return direction === 'asc' ? a.localeCompare(b as any) : (b as any).localeCompare(a)
  } else if(typeof a === 'number') {
    return direction === 'asc' ? a - (b as any) : (b as any) - a
  } else if(typeof a === 'boolean') {
    return direction === 'asc' ? (a ? 1 : 0) - (b as any ? 1 : 0) : (b as any ? 1 : 0) - (a ? 1 : 0)
  } else {
    return 0
  }
}