local curl = require'plenary.curl'
local Job = require'plenary.job'
local Path = require'plenary.path'

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

local function find_up(path, file_to_find)
  local current_directory = Path:new(path)
  while true do
    local parent_directory = current_directory:parent()
    if tostring(parent_directory) == tostring(current_directory) then
      break
    end
    current_directory = parent_directory

    local potential_file = current_directory:joinpath(file_to_find)
    if potential_file:exists() then
      return Path:new(potential_file:absolute())
    end
  end
end

function M.reval(host)
  local file = Path:new(vim.fn.expand('%:p'))
  local revalrc = find_up(tostring(file), ".revalrc")

  if (host == nil or host == "") and revalrc:exists() then
    host = revalrc:read()
  elseif host == nil or host == "" then
      host = last_host
  end
  last_host = host

  local repo_root = table.concat(Job:new{
    command = 'git',
    args = {'rev-parse', '--show-toplevel'},
    cwd = tostring(file:parent()),
    enabled_recording = true,
  }:sync(), '')
  local file_relative_to_repo_root = file:make_relative(repo_root)
  local file_relative_to_dev = '/src/qualia/' .. file_relative_to_repo_root

  local url = "http://" .. host .. "/reval/reload?filePath=" .. file_relative_to_dev
  curl.post(url, {
    raw_body = buftxt(),
    raw = { "-m", "5" },
    callback = vim.schedule_wrap(function(result)
      -- result = {
      --   body = "",
      --   exit = 0,
      --   headers = { "Server: nginx/1.15.12", "Date: Tue, 12 Apr 2022 23:32:30 GMT", "Content-Length: 0", "Connection: keep-alive", "x-content-type-options: nosniff", "", "" },
      --   status = 200
      -- }
      assert(result.exit == 0, "curl exited with a non-zero exit code:" .. result.exit)
      assert(result.status == 200, "response returned non-200 status-code:" .. result.status)
      print("reval'd", file_relative_to_dev, "at", host)
    end)
  })
end

return M
