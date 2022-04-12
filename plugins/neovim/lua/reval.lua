local curl = require'plenary.curl'

M = {}

local last_host = "localhost:3000"

local function buftxt()
  local buf_no = vim.api.nvim_win_get_buf(0)
  local lines = vim.api.nvim_buf_get_lines(buf_no, 0, vim.api.nvim_buf_line_count(buf_no), true)
  local s = ''
  for _, line in ipairs(lines) do
    s = s .. line .. '\n'
  end
  return s
end

function M.reval(host)
  if host == nil or host == "" then
    host = last_host
  end
  last_host = host

  local txt = buftxt()
  local url = "http://" .. host .. "/reval/reload?filePath=" .. vim.fn.expand('%:p')
  print(url)
  curl.post(url, {
    raw_body = txt,
    callback = vim.schedule_wrap(function()
      print("reval'd '" .. vim.fn.expand('%'), "'")
    end)
  })
end

return M
