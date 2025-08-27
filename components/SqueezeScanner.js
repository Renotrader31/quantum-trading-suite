                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {stock.optionsMetrics.term || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
                              </div>
                            
                            {/* Recent Flows if available */}
                            {stock.recentFlows && stock.recentFlows.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-bold mb-2">Recent Option Flows</h4>
                                <div className="space-y-2">
                                  {stock.recentFlows.slice(0, 5).map((flow, i) => (
                                    <div key={i} className="bg-gray-800 rounded p-2 text-sm grid grid-cols-5 gap-2">
                                      <div>
                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                          flow.type === 'CALL' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                                        }`}>
                                          {flow.type}
                                        </span>
                                        <span className="ml-2">${flow.strike}</span>
                                      </div>
                                      <div>${(flow.premium / 1000000).toFixed(2)}M</div>
                                      <div>{flow.volume.toLocaleString()} contracts</div>
                                      <div className="flex gap-1">
                                        {flow.unusual && <span className="bg-purple-900/50 text-purple-400 px-1 rounded text-xs">UNUSUAL</span>}
                                      </div>
                                      <div className="text-right text-gray-400">{flow.time}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
