from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QLabel
from PyQt5.QtGui import QPixmap, QImage
from threading import Timer
import numpy as np
import cv2


class QImageLabel(QLabel):
    """Custom QLabel with methods to display numpy arrays (opencv images)."""

    def __init__(self, qlabel, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.qlabel = qlabel

    def arrayToPixmap(
        self, array: np.ndarray = None, width: int = 480, height: int = 600
    ):
        """It converts an image array to a QPixmap format.
        Args:
            array: image array
            width: scaled width
            width: scaled height
        """
        rgb = cv2.cvtColor(array, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb.shape
        bytesPerLine = ch * w
        qimage = QImage(rgb.data, w, h, bytesPerLine, QImage.Format_RGB888)
        qimage = qimage.scaled(width, height, Qt.KeepAspectRatio)
        qpixmap = QPixmap.fromImage(qimage)
        return qpixmap

    def setImage(
        self, array: np.ndarray = None, scaledWidth: int = 480, scaledHeight: int = 600
    ):
        """It sets and image array over the label as QPixmap, to be displayed.
        Args:
            array: image array
            scaledWidth: scaled width
            scaledHeight: scaled height
        """
        try:
            if array is not None:
                qimage = self.arrayToPixmap(
                    array, width=scaledWidth, height=scaledHeight
                )
                self.qlabel.setPixmap(qimage)
        except Exception as e:
            print("--> QImageLabel:: ", e)