;; Copy this code somewhere that Emacs will find it. If you have a
;; private layer you could put it there, but just sticking it in
;; ~/.spacemacs should work.
;;
;; If your server isn't located at localhost:3000, you can modify that
;; reference on the `(concat ...` line.

(defun qr--reload ()
  (require 'request)
  (interactive)
  (request
   (concat "http://localhost:3000/reval/reload?filePath=" (buffer-file-name))
   :type "POST"
   :data (buffer-string)
   )
  )
(spacemacs/set-leader-keys "or" 'qr--reload)
