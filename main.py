import pygame
import traceback
from typing import Tuple
from pygame.locals import *
from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *


vertices= (
    (1, -1, -1),
    (1, 1, -1),
    (-1, 1, -1),
    (-1, -1, -1),
    (1, -1, 1),
    (1, 1, 1),
    (-1, -1, 1),
    (-1, 1, 1)
    )

edges = (
    (0,1),
    (0,3),
    (0,4),
    (2,1),
    (2,3),
    (2,7),
    (6,3),
    (6,4),
    (6,7),
    (5,1),
    (5,4),
    (5,7)
    )


## GLOBAL VARIABLES
cubes = {}
# id_seed = 0


## CLASSES & METHODS
class Cube(object):
    vertices: Tuple[tuple]
    edges: Tuple[tuple]
    # id: int
    red: int
    green: int
    blue: int

    def __init__(self, edges, vertices):
        self.edges = edges
        self.vertices = vertices
        # self.id = id_seed
        # self.red = (self.id & 0x000000FF) >>  0
        # self.green = (self.id & 0x0000FF00) >>  8
        # self.blue = (self.id & 0x00FF0000) >> 16
        self.red = (id(self) & 0x000000FF) >>  0
        self.green = (id(self) & 0x0000FF00) >>  8
        self.blue = (id(self) & 0x00FF0000) >> 16
        # id_seed += 1

        # cubes[(self.red, self.green, self.blue)] = self.id
        cubes[(self.red, self.green, self.blue)] = self


    def draw(self) -> bool:
        glEnable(GL_DEPTH_TEST)
        glDepthFunc(GL_LESS)
        try:
            glBegin(GL_LINES)
            for edge in edges:
                for vertex in edge:
                    glVertex3fv(vertices[vertex])
            glEnd()
            return True
        except Exception:
            traceback.print_exc()
            return False

    @staticmethod
    def get_cube_by_color(red, green, blue):
        return cubes.get((red, green, blue))


if __name__ == "__main__":
    glutInit()
    glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB | GLUT_DEPTH)
    pygame.init()
    display = (800,600)
    pygame.display.set_mode(display, DOUBLEBUF|OPENGL)
    gluPerspective(45, (display[0]/display[1]), 0.1, 50.0)
    glTranslatef(0.0,0.0,-5)
    cube = Cube(edges, vertices)
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                quit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 4:
                    # glScalef(0.5,0.5,1.0)
                    glTranslatef(0.0,0.0,-1)
                elif event.button == 5:   
                    # glScalef(2.0,2.0,1.0)
                    glTranslatef(0.0,0.0,1)
        # glRotatef(1, 3, 1, 1)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        cube.draw()
        pygame.display.flip()
        pygame.time.wait(10)
